import dayjs from 'dayjs';
import type { ClientSession, Types } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo/mongo.condig';
import {
	type PasswordResetDocument,
	passwordResetModel,
} from '../models/password-reset.model';

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

export const passwordResetRepository = createPasswordResetRepository();
