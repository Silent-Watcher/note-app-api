import dayjs from 'dayjs';
import type { ClientSession, Types } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo.condig';
import {
	type PasswordResetDocument,
	passwordResetModel,
} from '../models/password-reset.model';

/**
 * Interface defining the methods for interacting with password reset documents in the database.
 */
export interface IPasswordResetRepository {
	create(
		user: Types.ObjectId,
		tokenHash: string,
		session?: ClientSession,
	): Promise<PasswordResetDocument>;

	findValidByTokenHash(
		token: string,
		session?: ClientSession,
	): Promise<PasswordResetDocument | null>;
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
	async create(
		user: Types.ObjectId,
		tokenHash: string,
		session?: ClientSession,
	): Promise<PasswordResetDocument> {
		return unwrap(
			(await mongo.fire(() =>
				passwordResetModel.create(
					[
						{
							user,
							tokenHash,
						},
					],
					{ session },
				),
			)) as CommandResult<PasswordResetDocument>,
		);
	},

	async findValidByTokenHash(
		token: string,
		session?: ClientSession,
	): Promise<PasswordResetDocument | null> {
		return unwrap(
			(await mongo.fire(() =>
				passwordResetModel.findOne(
					{
						tokenHash: token,
						used: { $eq: false },
						expiresAt: { $gt: dayjs().toDate() },
					},
					null,
					{ session },
				),
			)) as CommandResult<PasswordResetDocument | null>,
		);
	},
});

/**
 * Singleton instance of the password reset repository.
 */
export const passwordResetRepository = createPasswordResetRepository();
