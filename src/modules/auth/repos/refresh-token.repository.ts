import type { ClientSession, Types, UpdateResult } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo/mongo.condig';
import type {
	RefreshToken,
	RefreshTokenDocument,
} from '../models/refresh-token.model';
import { refreshTokenModel } from '../models/refresh-token.model';

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

const createRefreshTokenRepository = () => ({
	async create(
		newRefreshToken: Partial<RefreshToken>,
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

export const refreshTokenRepository = createRefreshTokenRepository();
