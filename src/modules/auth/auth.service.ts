import { compare, hash } from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { type Types, type UpdateResult, startSession } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { generateSecureResetPasswordToken } from '#app/common/helpers/resetPasswordToken';
import { createHttpError } from '#app/common/utils/http.util';
import { CONFIG } from '#app/config';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { userService } from '#app/modules/users/user.service';
import type { UserDocument } from '../users/user.model';
import type { LoginUserDto } from './dtos/login-user.dto';
import {
	type IPasswordResetRepository,
	passwordResetRepository,
} from './password-reset.repository';
import { refreshTokenRepository } from './refresh-token.repository';
import type { IRefreshTokenRepository } from './refresh-token.repository';

/**
 * Interface defining the authentication service methods.
 */
export interface IAuthService {
	registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: UserDocument;
		accessToken: string;
		refreshToken: string;
	}>;

	refreshTokensV1(refreshToken: string): Promise<{
		accessToken: string;
		refreshToken: string;
	}>;

	invalidateAllTokens(user: Types.ObjectId): Promise<UpdateResult>;

	loginV1(loginUserDto: LoginUserDto): Promise<{
		user: UserDocument;
		accessToken: string;
		refreshToken: string;
	}>;

	requestPasswordResetV1(
		email: string,
	): Promise<{ raw: string; hash: string }>;

	resetPasswordV1(token: string, password: string): Promise<UpdateResult>;
}

const createAuthService = (
	refreshTokenRepo: IRefreshTokenRepository,
	passwordResetRepo: IPasswordResetRepository,
) => ({
	/**
	 * Registers a new user in the system.
	 *
	 * - Checks if the email is already taken.
	 * - Hashes the user's password securely.
	 * - Creates a new user record in the database.
	 * - Issues a new access token and refresh token for the user.
	 * - Saves the refresh token in the database for session management.
	 *
	 * @async
	 * @param {CreateUserDto} createUserDto - Data Transfer Object containing the user's email and password.
	 * @returns {Promise<{ newUser: UserDocument, accessToken: string, refreshToken: string }>}
	 * An object containing the newly created user document, a new access token, and a new refresh token.
	 * @throws {HttpError} Throws 400 Bad Request if the email is already in use.
	 */
	async registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: UserDocument;
		accessToken: string;
		refreshToken: string;
	}> {
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

		const accessToken = jwt.sign(
			{ userId: newUser._id },
			CONFIG.SECRET.ACCESS_TOKEN,
			{ expiresIn: '5m' },
		);

		const refreshToken = jwt.sign(
			{ userId: newUser._id },
			CONFIG.SECRET.REFRESH_TOKEN,
			{ expiresIn: '1d' },
		);

		await refreshTokenRepo.create({
			hash: refreshToken,
			rootIssuedAt: dayjs().toDate(),
			user: newUser._id,
		});

		return { newUser, accessToken, refreshToken };
	},

	/**
	 * Verifies, validates, and rotates the provided refresh token.
	 *
	 * - Verifies the provided refresh token's signature.
	 * - Checks token existence and status in the database (to detect reuse or expiration).
	 * - Handles sliding expiration and absolute session expiration.
	 * - On successful validation, issues a new access token and refresh token.
	 * - Marks the old refresh token as invalid and saves the new one.
	 *
	 * @async
	 * @param {string} refreshToken - The refresh token provided by the client for renewal.
	 * @returns {Promise<{ refreshToken: string, accessToken: string }>} An object containing a new access token and a new refresh token.
	 * @throws {HttpError} Throws 401 Unauthorized if token is invalid, reused, expired, or session has ended.
	 */
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

		const newAccessToken = jwt.sign(
			{ userId },
			CONFIG.SECRET.ACCESS_TOKEN,
			{ expiresIn: '5m' },
		);

		const newRefreshToken = jwt.sign(
			{ userId },
			CONFIG.SECRET.REFRESH_TOKEN,
			{ expiresIn: '1d' },
		);

		await refreshTokenRepo.create({
			user: userId,
			hash: newRefreshToken,
			rootIssuedAt: doc.rootIssuedAt,
		});

		return { refreshToken: newRefreshToken, accessToken: newAccessToken };
	},

	/**
	 * Invalidates all refresh tokens associated with the given user.
	 *
	 * @param {Types.ObjectId} user - The ObjectId of the user whose tokens should be invalidated.
	 * @returns {Promise<UpdateResult>} A promise that resolves to the result of the update operation.
	 */
	async invalidateAllTokens(user: Types.ObjectId): Promise<UpdateResult> {
		return refreshTokenRepo.invalidateMany(user);
	},

	/**
	 * Authenticates a user using their email and password (v1).
	 *
	 * @async
	 * @function loginV1
	 * @param {LoginUserDto} loginUserDto - Data transfer object containing the user's credentials.
	 * @param {string} loginUserDto.email - The email address of the user attempting to log in.
	 * @param {string} loginUserDto.password - The plaintext password provided by the user.
	 * @throws {HttpError} Throws a 400 Bad Request error with code `USER_NOT_FOUND` if no account is associated with the given email.
	 * @throws {HttpError} Throws a 400 Bad Request error with code `INVALID_PASSWORD` if the provided password does not match.
	 * @returns {Promise<Object>} An object containing:
	 *   - `user` {UserDocument}: The authenticated user's document.
	 *   - `accessToken` {string}: A JWT access token, valid for 5 minutes.
	 *   - `refreshToken` {string}: A JWT refresh token, valid for 1 day.
	 */
	async loginV1(loginUserDto: LoginUserDto): Promise<{
		user: UserDocument;
		accessToken: string;
		refreshToken: string;
	}> {
		const { email, password } = loginUserDto;
		const foundedUser = await userService.findOneByEmail(email);
		if (!foundedUser) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'USER_NOT_FOUND',
				message: 'No account found for the provided email address.',
			});
		}

		const isPasswordValid = await compare(password, foundedUser.password);
		if (!isPasswordValid) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'INVALID_PASSWORD',
				message: 'The provided password is not valid.',
			});
		}

		const newAccessToken = jwt.sign(
			{ userId: foundedUser._id },
			CONFIG.SECRET.ACCESS_TOKEN,
			{ expiresIn: '5m' },
		);

		const newRefreshToken = jwt.sign(
			{ userId: foundedUser._id },
			CONFIG.SECRET.REFRESH_TOKEN,
			{ expiresIn: '1d' },
		);

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

	/**
	 * Initiates a password reset request by generating a secure token for the user.
	 *
	 * This function performs the following:
	 * 1. Verifies that a user with the given email exists.
	 * 2. Generates a secure token (both raw and hashed versions).
	 * 3. Stores the hashed token in the database for future validation.
	 *
	 * @param {string} email - The email address of the user requesting a password reset.
	 * @returns {Promise<{ raw: string; hash: string }>} An object containing the raw token (for sending via email) and the hashed token (stored in the database).
	 * @throws {HttpError} If no user is found with the provided email.
	 */
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

	/**
	 * Resets the user's password using a valid reset token.
	 *
	 * This function performs the following steps in a transaction:
	 * 1. Validates the reset token.
	 * 2. Hashes the new password.
	 * 3. Marks the token as used.
	 * 4. Updates the user's password in the database.
	 *
	 * @param {string} token - The reset token provided to the user.
	 * @param {string} password - The new password to set for the user.
	 * @returns {Promise<UpdateResult>} A promise that resolves to the result of the password update operation.
	 * @throws {HttpError} If the token is invalid or any error occurs during the transaction.
	 */
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
});

/**
 * Singleton instance of the authentication service.
 *
 * Provides methods related to user authentication, such as registering new users
 * and refreshing access/refresh tokens.
 */
export const authService = createAuthService(
	refreshTokenRepository,
	passwordResetRepository,
);
