import { hash } from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import type { Document, Types, UpdateResult } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { CONFIG } from '#app/config';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { userService } from '#app/modules/users/user.service';
import { refreshTokenRepository } from './auth.repository';
import type { IRefreshTokenRepository } from './auth.repository';

/**
 * Interface defining the authentication service methods.
 */
export interface IAuthService {
	registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: Document;
		accessToken: string;
		refreshToken: string;
	}>;
	refreshTokensV1(refreshToken: string): Promise<{
		accessToken: string;
		refreshToken: string;
	}>;

	invalidateAllTokens(user: Types.ObjectId): Promise<UpdateResult>;
}

const createAuthService = (refreshTokenRepo: IRefreshTokenRepository) => ({
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
	 * @returns {Promise<{ newUser: Document, accessToken: string, refreshToken: string }>}
	 * An object containing the newly created user document, a new access token, and a new refresh token.
	 * @throws {HttpError} Throws 400 Bad Request if the email is already in use.
	 */
	async registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: Document;
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
});

/**
 * Singleton instance of the authentication service.
 *
 * Provides methods related to user authentication, such as registering new users
 * and refreshing access/refresh tokens.
 */
export const authService = createAuthService(refreshTokenRepository);
