import { compare, hash } from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import mongoose, { startSession } from 'mongoose';
import type { Types, UpdateResult } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { issueToken } from '#app/common/helpers/jwt';
import { generateOtp } from '#app/common/helpers/otp';
import { recordFailure, resetFailures } from '#app/common/helpers/redis';
import { generateSecureResetPasswordToken } from '#app/common/helpers/resetPasswordToken';
import { createHttpError } from '#app/common/utils/http.util';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '#app/config';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { userService } from '#app/modules/users/user.service';
import type { UserDocument } from '../users/user.model';
import type { LoginUserDto } from './dtos/login-user.dto';
import type { OtpDocument } from './models/otp.model';
import type { IOtpRepository } from './repos/otp.repository';
import { otpRepository } from './repos/otp.repository';
import type { IPasswordResetRepository } from './repos/password-reset.repository';
import { passwordResetRepository } from './repos/password-reset.repository';
import type { IRefreshTokenRepository } from './repos/refresh-token.repository';
import { refreshTokenRepository } from './repos/refresh-token.repository';

export interface IAuthService {
	registerV1(createUserDto: CreateUserDto): Promise<UserDocument>;

	refreshTokensV1(refreshToken: string): Promise<{
		accessToken: string;
		refreshToken: string;
	}>;

	invalidateAllTokens(user: Types.ObjectId): Promise<UpdateResult>;

	loginV1(
		loginUserDto: LoginUserDto,
		userIp: string,
	): Promise<{
		user: UserDocument;
		accessToken: string;
		refreshToken: string;
	}>;

	requestPasswordResetV1(
		email: string,
	): Promise<{ raw: string; hash: string }>;

	resetPasswordV1(token: string, password: string): Promise<UpdateResult>;

	verifyEmail(
		email: string,
		code: string,
	): Promise<{
		user: UserDocument;
		accessToken: string;
		refreshToken: string;
	}>;

	createOtp(
		type: 'email_verification',
		userId: Types.ObjectId,
	): Promise<OtpDocument>;
}

const createAuthService = (
	refreshTokenRepo: IRefreshTokenRepository,
	passwordResetRepo: IPasswordResetRepository,
	otpRepo: IOtpRepository,
) => ({
	async registerV1(createUserDto: CreateUserDto): Promise<UserDocument> {
		const { email, password } = createUserDto;

		const emailTaken = await userService.findOneByEmail(email);
		if (emailTaken) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'email is already in use',
			});
		}

		const hashedPassword = await hash(password, 10);

		const newUser = await userService.create({
			email,
			password: hashedPassword,
		});

		return newUser;
	},

	async refreshTokensV1(refreshToken: string) {
		const now = dayjs();

		const decoded = jwt.verify(
			refreshToken,
			CONFIG.SECRET.REFRESH_TOKEN,
		) as jwt.JwtPayload;

		const userId = decoded.userId;

		const doc = await refreshTokenRepo.findOne(refreshToken, userId);

		if (!doc) {
			throw createHttpError(httpStatus.UNAUTHORIZED, {
				code: 'UNAUTHORIZED',
				message: 'invalid token',
			});
		}

		// Reuse detection
		if (doc.status === 'invalid') {
			await doc.updateOne({ revokedAt: now.toDate() });
			throw createHttpError(httpStatus.UNAUTHORIZED, {
				code: 'UNAUTHORIZED',
				message: 'Reuse detected, please log in',
			});
		}

		// Sliding expiration check
		if (now.isAfter(doc.expiresAt)) {
			await doc.updateOne({ status: 'invalid' });
			throw createHttpError(httpStatus.UNAUTHORIZED, {
				code: 'UNAUTHORIZED',
				message: 'Refresh token expired, please log in',
			});
		}

		// Absolute expiration check
		if (
			now.diff(dayjs(doc.rootIssuedAt), 'day') >= CONFIG.MAX_SESSION_DAYS
		) {
			await doc.updateOne({ status: 'invalid' });
			throw createHttpError(httpStatus.UNAUTHORIZED, {
				code: 'UNAUTHORIZED',
				message: 'Session expired, please log in',
			});
		}

		// Rotate: invalidate old and issue new
		await doc.updateOne({ status: 'invalid' });

		// const newAccessToken = jwt.sign(
		// 	{ userId },
		// 	CONFIG.SECRET.ACCESS_TOKEN,
		// 	{ expiresIn: '5m' },
		// );

		const newAccessToken = issueToken(
			{ userId },
			CONFIG.SECRET.ACCESS_TOKEN,
			{ expiresIn: '5m' },
		);

		const newRefreshToken = issueToken(
			{ userId },
			CONFIG.SECRET.REFRESH_TOKEN,
			{ expiresIn: '1d' },
		);

		// const newRefreshToken = jwt.sign(
		// 	{ userId },
		// 	CONFIG.SECRET.REFRESH_TOKEN,
		// 	{ expiresIn: "1d" },
		// );

		await refreshTokenRepo.create({
			user: userId,
			hash: newRefreshToken,
			rootIssuedAt: doc.rootIssuedAt,
		});

		return { refreshToken: newRefreshToken, accessToken: newAccessToken };
	},

	async invalidateAllTokens(user: Types.ObjectId): Promise<UpdateResult> {
		return refreshTokenRepo.invalidateMany(user);
	},

	async loginV1(
		loginUserDto: LoginUserDto,
		userIp: string,
	): Promise<{
		user: UserDocument;
		accessToken: string;
		refreshToken: string;
	}> {
		const { email, password } = loginUserDto;
		const foundedUser = await userService.findOneByEmail(email);
		if (!foundedUser) {
			await recordFailure(
				userIp,
				'login:failure:ip',
				30 * 60,
				5,
				'login:block:ip',
				24 * 60 * 60,
			);
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'invalid credentials',
			});
		}

		const isPasswordValid = await compare(password, foundedUser.password);
		if (!isPasswordValid) {
			await recordFailure(
				userIp,
				'login:failure:ip',
				30 * 60,
				5,
				'login:block:ip',
				24 * 60 * 60,
			);
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'invalid credentials',
			});
		}

		await resetFailures(userIp, 'login:failure:ip');

		// const newAccessToken = jwt.sign(
		// 	{ userId: foundedUser._id },
		// 	CONFIG.SECRET.ACCESS_TOKEN,
		// 	{ expiresIn: "5m" },
		// );

		const newAccessToken = issueToken(
			{ userId: foundedUser._id },
			CONFIG.SECRET.ACCESS_TOKEN,
			{ expiresIn: '5m' },
		);

		const newRefreshToken = issueToken(
			{ userId: foundedUser._id },
			CONFIG.SECRET.REFRESH_TOKEN,
			{ expiresIn: '1d' },
		);

		// const newRefreshToken = jwt.sign(
		// 	{ userId: foundedUser._id },
		// 	CONFIG.SECRET.REFRESH_TOKEN,
		// 	{ expiresIn: "1d" },
		// );

		await refreshTokenRepo.create({
			user: foundedUser._id,
			hash: newRefreshToken,
			rootIssuedAt: dayjs().toDate(),
		});

		return {
			user: foundedUser,
			refreshToken: newRefreshToken,
			accessToken: newAccessToken,
		};
	},

	async requestPasswordResetV1(
		email: string,
	): Promise<{ raw: string; hash: string }> {
		const foundedUser = await userService.findOneByEmail(email);
		if (!foundedUser) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD_REQUEST',
				message: 'user with this email not found',
			});
		}

		const secureToken = await generateSecureResetPasswordToken();

		const newPasswordReset = await passwordResetRepo.create(
			foundedUser._id,
			secureToken.hash,
		);

		return secureToken;
	},

	async resetPasswordV1(
		token: string,
		password: string,
	): Promise<UpdateResult> {
		const session = await startSession();
		session.startTransaction();
		try {
			const tokenExists =
				await passwordResetRepo.findValidByTokenHash(token);
			if (!tokenExists) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'invalid reset password token',
				});
			}

			const hashedPassword = await hash(password, 10);

			await tokenExists.updateOne({ $set: { used: true } });

			const updateResult = await userService.updatePassword(
				tokenExists.user as Types.ObjectId,
				hashedPassword,
			);

			await session.commitTransaction();
			await session.endSession();

			return updateResult;
		} catch (error) {
			await session.abortTransaction();
			await session.endSession();
			throw error;
		}
	},

	async verifyEmail(
		email: string,
		code: string,
	): Promise<{
		user: UserDocument;
		accessToken: string;
		refreshToken: string;
	}> {
		const user = await userService.findOneByEmail(
			email,
			{
				isEmailVerified: 1,
				_id: 1,
			},
			false,
		);

		if (!user) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD_REQUEST',
				message: 'invalid email',
			});
		}

		if (user.isEmailVerified) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD_REQUEST',
				message: 'email already verified',
			});
		}

		// Check OTP
		const otp = await otpRepo.getLatestUnusedVerifyEmailOtp(user._id);

		if (!otp || otp.code !== code) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'Invalid or missing OTP.',
			});
		}

		if (!dayjs().isBefore(otp.expiresAt)) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'OTP has expired.',
			});
		}

		// Mark verified
		const session = await mongoose.startSession();
		try {
			session.startTransaction();

			await user.updateOne(
				{
					isEmailVerified: true,
					displayName: email.split('@').at(0),
				},
				{ session },
			);
			await otp.updateOne({ used: true }, { session });

			const accessToken = issueToken(
				{ userId: user._id },
				CONFIG.SECRET.ACCESS_TOKEN,
				{ expiresIn: '5m' },
			);

			// const accessToken = jwt.sign(
			// 	{ userId: user._id },
			// 	CONFIG.SECRET.ACCESS_TOKEN,
			// 	{ expiresIn: "5m" },
			// );

			// const refreshToken = jwt.sign(
			// 	{ userId: user._id },
			// 	CONFIG.SECRET.REFRESH_TOKEN,
			// 	{ expiresIn: "1d" },
			// );

			const refreshToken = issueToken(
				{ userId: user._id },
				CONFIG.SECRET.REFRESH_TOKEN,
				{ expiresIn: '1d' },
			);

			await refreshTokenRepo.create(
				{
					hash: refreshToken,
					rootIssuedAt: dayjs().toDate(),
					user: user._id,
				},
				session,
			);

			await session.commitTransaction();

			return {
				user,
				accessToken,
				refreshToken,
			};
		} catch (error) {
			await session.abortTransaction();
			logger.error(
				`Transaction aborted due to: ${(error as Error)?.message}`,
			);
			throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
				code: 'INTERNAL SERVER ERROR',
				message: 'Transaction failed',
			});
		}
	},

	async createOtp(
		type: 'email_verification',
		userId: Types.ObjectId,
	): Promise<OtpDocument> {
		const code = generateOtp(5);
		const otp = await otpRepo.create(type, code, userId);
		return otp;
	},
});

export const authService = createAuthService(
	refreshTokenRepository,
	passwordResetRepository,
	otpRepository,
);
