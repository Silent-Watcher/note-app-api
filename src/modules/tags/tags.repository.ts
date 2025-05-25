import type { Types } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo.condig';
import { type TagDocument, tagModel } from './tags.model';

export interface ITagsRepository {
	getAll(userId: Types.ObjectId): Promise<TagDocument[] | []>;
}

const createTagsRepository = () => ({
	async getAll(userId: Types.ObjectId): Promise<TagDocument[] | []> {
		return unwrap(
			(await mongo.fire(() =>
				tagModel.find({ user: userId }),
			)) as CommandResult<TagDocument[] | []>,
		);
	},
});

export const tagsRepository = createTagsRepository();
