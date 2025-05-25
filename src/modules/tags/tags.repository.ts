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
import type { ID } from '#app/config/db/mongo.condig';
import { tagModel } from './tags.model';
import type { TagDocument } from './tags.model';

export interface ITagsRepository {
	getAll(userId: ID, session?: ClientSession): Promise<TagDocument[] | []>;
	existsParentWithId(id: ID, session?: ClientSession): Promise<boolean>;
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

	async existsParentWithId(
		id: ID,
		session?: ClientSession,
	): Promise<boolean> {
		const foundedTag = await unwrap(
			(await mongo.fire(() =>
				tagModel
					.exists({ _id: id, parent: { $exists: false } })
					.session((session as ClientSession) ?? undefined),
			)) as CommandResult<Promise<null | { _id: Types.ObjectId }>>,
		);
		// biome-ignore lint/complexity/noUselessTernary: we want to return boolean not {_id: ..}
		return foundedTag?._id ? true : false;
	},

	async create(
		name: string,
		color: string,
		user: ID,
		parent?: ID,
		session?: ClientSession,
	): Promise<TagDocument> {
		return unwrap(
			(await mongo.fire(() =>
				// tagModel.create(
				// 	{
				// user,
				// ...(parent ? { parent } : {}),
				// name,
				// color,
				// 	},
				// )
				{
					const doc = new tagModel({
						user,
						...(parent ? { parent } : {}),
						name,
						color,
					});
					return doc.save({ session });
				},
			)) as CommandResult<Promise<TagDocument>>,
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
});

export const tagsRepository = createTagsRepository();
