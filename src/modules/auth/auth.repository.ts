import type { Types, UpdateResult } from 'mongoose';
import { refreshTokenModel } from './auth.model';
import type { RefreshToken, RefreshTokenDocument } from './auth.model';

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
	): Promise<RefreshTokenDocument>;

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
	async create(newRefreshToken: RefreshToken): Promise<RefreshTokenDocument> {
		const result = await refreshTokenModel.create(newRefreshToken);
		return result;
	},

	async findOne(
		refreshToken: string,
		userId: Types.ObjectId,
	): Promise<RefreshTokenDocument> {
		const result = await refreshTokenModel.findOne({
			user: userId,
			hash: refreshToken,
		});
		return result as RefreshTokenDocument;
	},

	/**
	 * Invalidates all refresh tokens belonging to the specified user by setting their status to "invalid".
	 *
	 * @param {Types.ObjectId} user - The ObjectId of the user whose refresh tokens should be invalidated.
	 * @returns {Promise<UpdateResult>} A promise that resolves to the result of the updateMany operation.
	 */
	async invalidateMany(user: Types.ObjectId): Promise<UpdateResult> {
		const result = await refreshTokenModel.updateMany(
			{ user },
			{
				$set: { status: 'invalid' },
			},
		);
		return result;
	},
});

/**
 * Singleton instance of the refresh token repository.
 */
export const refreshTokenRepository = createRefreshTokenRepository();
