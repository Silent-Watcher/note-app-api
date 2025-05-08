import type { Types, UpdateResult } from 'mongoose';
import { mongo } from '#app/config/db/mongo.condig';
import { refreshTokenModel } from './refresh-token.model';
import type { RefreshToken, RefreshTokenDocument } from './refresh-token.model';

/**
 * Interface defining the methods for interacting with refresh token documents in the database.
 */
export interface IRefreshTokenRepository {
	create(
		newRefreshToken: Partial<RefreshToken>,
	): Promise<RefreshTokenDocument>;

	findOne(
		refreshToken: string,
		userId: Types.ObjectId,
	): Promise<RefreshTokenDocument | null>;

	invalidateMany(user: Types.ObjectId): Promise<UpdateResult>;
}

/**
 * Factory function to create an instance of the refresh token repository.
 *
 * Provides methods for creating and finding refresh token documents.
 *
 * @returns {{
 *   create(newRefreshToken: RefreshToken): Promise<RefreshTokenDocument>;
 *   findOne(refreshToken: string, userId: Types.ObjectId): Promise<RefreshTokenDocument>;
 * }}
 */
const createRefreshTokenRepository = () => ({
	create(newRefreshToken: RefreshToken): Promise<RefreshTokenDocument> {
		return mongo.fire(() =>
			refreshTokenModel.create(newRefreshToken),
		) as Promise<RefreshTokenDocument>;
	},

	findOne(
		refreshToken: string,
		userId: Types.ObjectId,
	): Promise<RefreshTokenDocument | null> {
		return mongo.fire(() =>
			refreshTokenModel.findOne({
				user: userId,
				hash: refreshToken,
			}),
		) as Promise<RefreshTokenDocument | null>;
	},

	/**
	 * Invalidates all refresh tokens belonging to the specified user by setting their status to "invalid".
	 *
	 * @param {Types.ObjectId} user - The ObjectId of the user whose refresh tokens should be invalidated.
	 * @returns {Promise<UpdateResult>} A promise that resolves to the result of the updateMany operation.
	 */
	invalidateMany(user: Types.ObjectId): Promise<UpdateResult> {
		return mongo.fire(() =>
			refreshTokenModel.updateMany(
				{ user },
				{
					$set: { status: 'invalid' },
				},
			),
		) as Promise<UpdateResult>;
	},
});

/**
 * Singleton instance of the refresh token repository.
 */
export const refreshTokenRepository = createRefreshTokenRepository();
