import type { Types } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo.condig';
import { type TagDocument, tagModel } from './tags.model';

export interface ITagsRepository {
	getAll(userId: Types.ObjectId): Promise<TagDocument[] | []>;
	existsWithId(id: Types.ObjectId): Promise<boolean>;
	create(
		name: string,
		color: string,
		parent: Types.ObjectId,
		user: Types.ObjectId,
	): Promise<TagDocument>;
}

const createTagsRepository = () => ({
	async getAll(userId: Types.ObjectId): Promise<TagDocument[] | []> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.find({ user: userId }),
			)) as CommandResult<TagDocument[] | []>,
		);
	},

	async existsWithId(id: Types.ObjectId): Promise<boolean> {
		const foundedTag = await unwrap(
			(await mongo.fire(() =>
				tagModel.exists({ _id: id }),
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
	): Promise<TagDocument> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.create({
					user,
					parent,
					name,
					color,
				}),
			)) as CommandResult<Promise<TagDocument>>,
		);
	},
});

export const tagsRepository = createTagsRepository();
