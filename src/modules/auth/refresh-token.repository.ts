import type { Types, UpdateResult } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
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
	async create(newRefreshToken: RefreshToken): Promise<RefreshTokenDocument> {
		return unwrap(
			(await mongo.fire(() =>
				refreshTokenModel.create(newRefreshToken),
			)) as CommandResult<RefreshTokenDocument>,
		);
	},

	async findOne(
		refreshToken: string,
		userId: Types.ObjectId,
	): Promise<RefreshTokenDocument | null> {
		return unwrap(
			(await mongo.fire(() =>
				refreshTokenModel.findOne({
					user: userId,
					hash: refreshToken,
				}),
			)) as CommandResult<RefreshTokenDocument | null>,
		);
	},

	/**
	 * Invalidates all refresh tokens belonging to the specified user by setting their status to "invalid".
	 *
	 * @param {Types.ObjectId} user - The ObjectId of the user whose refresh tokens should be invalidated.
	 * @returns {Promise<UpdateResult>} A promise that resolves to the result of the updateMany operation.
	 */
	async invalidateMany(user: Types.ObjectId): Promise<UpdateResult> {
		return unwrap(
			(await mongo.fire(() =>
				refreshTokenModel.updateMany(
					{ user },
					{
						$set: { status: 'invalid' },
					},
				),
			)) as CommandResult<UpdateResult>,
		);
	},
});

/**
 * Singleton instance of the refresh token repository.
 */
export const refreshTokenRepository = createRefreshTokenRepository();
