import type {
	ClientSession,
	DeleteResult,
	FilterQuery,
	Types,
	UpdateQuery,
	UpdateResult,
} from 'mongoose';
import { unwrap } from '#app/config/db/global';
import type { CommandResult } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo.condig';
import type { ExistsResult, ID } from '#app/config/db/types';
import { tagModel } from './tags.model';
import type { TagDocument } from './tags.model';

export interface ITagsRepository {
	getAll(userId: ID, session?: ClientSession): Promise<TagDocument[] | []>;
	deleteOne(id: ID, session?: ClientSession): Promise<DeleteResult>;
	create(
		name: string,
		color: string,
		user: ID,
		parent?: ID,
		session?: ClientSession,
	): Promise<TagDocument>;

	updateOne(
		id: ID,
		update: UpdateQuery<TagDocument>,
		session?: ClientSession,
	): Promise<UpdateResult>;

	updateMany(
		filter: FilterQuery<TagDocument>,
		update: UpdateQuery<TagDocument>,
		session?: ClientSession,
	): Promise<UpdateResult>;

	isExists(
		filter: FilterQuery<TagDocument>,
		session?: ClientSession,
	): ExistsResult;

	countDocuments(
		filter: FilterQuery<TagDocument>,
		session?: ClientSession,
	): Promise<number>;
}

const createTagsRepository = () => ({
	async getAll(
		userId: ID,
		session?: ClientSession,
	): Promise<TagDocument[] | []> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.find({ user: userId }, null, { session }),
			)) as CommandResult<TagDocument[] | []>,
		);
	},

	async create(
		name: string,
		color: string,
		user: ID,
		parent?: ID,
		session?: ClientSession,
	): Promise<TagDocument> {
		return unwrap(
			(await mongo.fire(() => {
				const doc = new tagModel({
					user,
					...(parent ? { parent } : {}),
					name,
					color,
				});
				return doc.save({ session });
			})) as CommandResult<Promise<TagDocument>>,
		);
	},

	async deleteOne(id: ID, session?: ClientSession): Promise<DeleteResult> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.deleteOne({ _id: id }, { session }),
			)) as CommandResult<Promise<DeleteResult>>,
		);
	},

	async updateOne(
		id: ID,
		update: UpdateQuery<TagDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.updateOne({ _id: id }, update, { session }),
			)) as CommandResult<Promise<UpdateResult>>,
		);
	},

	async updateMany(
		filter: FilterQuery<TagDocument>,
		update: UpdateQuery<TagDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.updateMany(filter, update, { session }),
			)) as CommandResult<Promise<UpdateResult>>,
		);
	},

	async isExists(
		filter: FilterQuery<TagDocument>,
		session?: ClientSession,
	): ExistsResult {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.exists(filter).session(session as ClientSession),
			)) as CommandResult<Promise<null | { _id: Types.ObjectId }>>,
		);
	},

	async countDocuments(
		filter: FilterQuery<TagDocument>,
		session?: ClientSession,
	): Promise<number> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.countDocuments(filter, { session }),
			)) as CommandResult<Promise<number>>,
		);
	},
});

export const tagsRepository = createTagsRepository();
