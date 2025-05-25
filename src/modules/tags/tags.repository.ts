import type { ClientSession, DeleteResult, Types } from 'mongoose';
import type mongoose from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo.condig';
import type { CreateTagDto } from './dtos/create-tag.dto';
import { type TagDocument, tagModel } from './tags.model';

export interface ITagsRepository {
	getAll(
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<TagDocument[] | []>;
	existsParentWithId(
		id: Types.ObjectId,
		session?: ClientSession,
	): Promise<boolean>;
	deleteOne(
		id: Types.ObjectId,
		session?: ClientSession,
	): Promise<DeleteResult>;
	create(
		name: string,
		color: string,
		parent: Types.ObjectId,
		user: Types.ObjectId,
		session?: ClientSession,
	): Promise<TagDocument>;
}

const createTagsRepository = () => ({
	async getAll(
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<TagDocument[] | []> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.find({ user: userId }, null, { session }),
			)) as CommandResult<TagDocument[] | []>,
		);
	},

	async existsParentWithId(
		id: Types.ObjectId,
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
		parent: Types.ObjectId,
		user: Types.ObjectId,
		session?: ClientSession,
	): Promise<TagDocument> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.create(
					{
						user,
						parent,
						name,
						color,
					},
					{ session },
				),
			)) as CommandResult<Promise<TagDocument>>,
		);
	},

	async deleteOne(
		id: Types.ObjectId,
		session?: ClientSession,
	): Promise<DeleteResult> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.deleteOne({ _id: id }, { session }),
			)) as CommandResult<Promise<DeleteResult>>,
		);
	},
});

export const tagsRepository = createTagsRepository();
