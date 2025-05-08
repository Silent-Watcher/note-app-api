import dayjs from 'dayjs';
import type { Types } from 'mongoose';
import { mongo } from '#app/config/db/mongo.condig';
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

	findValidByTokenHash(token: string): Promise<PasswordResetDocument | null>;
}

/**
 * Factory function to create an instance of the refresh token repository.
 *
 * Provides methods for creating and finding refresh token documents.
 *
 * @returns {{
 *   create(newRefreshToken: RefreshToken): Promise<RefreshTokenDocument>;
 *   findValidByTokenHash(token: string): Promise<PasswordResetDocument | null>;
 * }}
 */
const createPasswordResetRepository = () => ({
	create(
		user: Types.ObjectId,
		tokenHash: string,
	): Promise<PasswordResetDocument> {
		return mongo.fire(() =>
			passwordResetModel.create({
				user,
				tokenHash,
			}),
		) as Promise<PasswordResetDocument>;
	},

	findValidByTokenHash(token: string): Promise<PasswordResetDocument | null> {
		return mongo.fire(() =>
			passwordResetModel.findOne({
				tokenHash: token,
				used: { $eq: false },
				expiresAt: { $gt: dayjs().toDate() },
			}),
		) as Promise<PasswordResetDocument | null>;
	},
});

/**
 * Singleton instance of the password reset repository.
 */
export const passwordResetRepository = createPasswordResetRepository();
