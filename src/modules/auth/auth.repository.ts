import { refreshTokenModel } from './auth.model';
import type { RefreshToken, RefreshTokenDocument } from './auth.model';

export interface IRefreshTokenRepository {
	create(
		newRefreshToken: Partial<RefreshToken>,
	): Promise<RefreshTokenDocument>;
}

const createRefreshTokenRepository = () => ({
	async create(newRefreshToken: RefreshToken): Promise<RefreshTokenDocument> {
		const result = await refreshTokenModel.create(newRefreshToken);
		return result;
	},
});

export const refreshTokenRepository = createRefreshTokenRepository();
