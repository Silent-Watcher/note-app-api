import type { Types } from 'mongoose';
import {
	type PasswordResetDocument,
	passwordResetModel,
} from './password-reset.model';

/**
 * Interface defining the methods for interacting with password reset documents in the database.
 */
export interface IPasswordResetRepository {
	create(
		user: Types.ObjectId,
		tokenHash: string,
	): Promise<PasswordResetDocument>;
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
const createPasswordResetRepository = () => ({
	async create(
		user: Types.ObjectId,
		tokenHash: string,
	): Promise<PasswordResetDocument> {
		const newPasswordReset = await passwordResetModel.create({
			user,
			tokenHash,
		});
		return newPasswordReset;
	},
});

/**
 * Singleton instance of the password reset repository.
 */
export const passwordResetRepository = createPasswordResetRepository();
