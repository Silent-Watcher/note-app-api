import type { Types } from 'mongoose';
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
		console.log('userId: ', userId);
		console.log('refreshToken: ', refreshToken);
		const result = await refreshTokenModel.findOne({
			user: userId,
			hash: refreshToken,
		});
		console.log('result inside model: ', result);
		return result as RefreshTokenDocument;
	},
});

/**
 * Singleton instance of the refresh token repository.
 */
export const refreshTokenRepository = createRefreshTokenRepository();
