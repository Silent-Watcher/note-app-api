import type { ClientSession, Types, UpdateResult } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo/mongo.condig';
import type {
	RefreshToken,
	RefreshTokenDocument,
} from '../models/refresh-token.model';
import { refreshTokenModel } from '../models/refresh-token.model';

/**
 * Interface defining the methods for interacting with refresh token documents in the database.
 */
export interface IRefreshTokenRepository {
	create(
		newRefreshToken: Partial<RefreshToken>,
		session?: ClientSession,
	): Promise<RefreshTokenDocument>;

	findOne(
		refreshToken: string,
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<RefreshTokenDocument | null>;

	invalidateMany(
		user: Types.ObjectId,
		session?: ClientSession,
	): Promise<UpdateResult>;
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
	async create(
		newRefreshToken: RefreshToken,
		session?: ClientSession,
	): Promise<RefreshTokenDocument> {
		return unwrap(
			(await mongo.fire(() =>
				refreshTokenModel.create([{ ...newRefreshToken }], { session }),
			)) as CommandResult<RefreshTokenDocument>,
		);
	},

	async findOne(
		refreshToken: string,
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<RefreshTokenDocument | null> {
		return unwrap(
			(await mongo.fire(() =>
				refreshTokenModel.findOne(
					{
						user: userId,
						hash: refreshToken,
					},
					null,
					{ session },
				),
			)) as CommandResult<RefreshTokenDocument | null>,
		);
	},

	/**
	 * Invalidates all refresh tokens belonging to the specified user by setting their status to "invalid".
	 *
	 * @param {Types.ObjectId} user - The ObjectId of the user whose refresh tokens should be invalidated.
	 * @returns {Promise<UpdateResult>} A promise that resolves to the result of the updateMany operation.
	 */
	async invalidateMany(
		user: Types.ObjectId,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return unwrap(
			(await mongo.fire(() =>
				refreshTokenModel.updateMany(
					{ user },
					{
						$set: { status: 'invalid' },
					},
					{ session },
				),
			)) as CommandResult<UpdateResult>,
		);
	},
});

/**
 * Singleton instance of the refresh token repository.
 */
export const refreshTokenRepository = createRefreshTokenRepository();
