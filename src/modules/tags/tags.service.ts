import type { Types } from 'mongoose';
import type { TagDocument } from './tags.model';
import { type ITagsRepository, tagsRepository } from './tags.repository';

export interface ITagsService {
	getAll(userId: Types.ObjectId): Promise<TagDocument[] | []>;
}

const createTagsService = (repo: ITagsRepository) => ({
	async getAll(userId: Types.ObjectId): Promise<TagDocument[] | []> {
		const tags = await repo.getAll(userId);
		return tags;
	},
});

export const tagsService = createTagsService(tagsRepository);
