import type { Types } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { TagDocument } from './tags.model';
import { type ITagsRepository, tagsRepository } from './tags.repository';

export interface ITagsService {
	getAll(userId: Types.ObjectId): Promise<TagDocument[] | []>;
	create(
		name: string,
		color: string,
		parent: Types.ObjectId,
		user: Types.ObjectId,
	): Promise<TagDocument>;
}

const createTagsService = (repo: ITagsRepository) => ({
	getAll(userId: Types.ObjectId): Promise<TagDocument[] | []> {
		return repo.getAll(userId);
	},

	async create(
		name: string,
		color: string,
		parent: Types.ObjectId,
		user: Types.ObjectId,
	): Promise<TagDocument> {
		// check if we have a proper tag with this given parent id
		const parentExists = await repo.existsWithId(parent);

		if (!parentExists) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'parent tag with given id not found',
			});
		}

		return repo.create(name, color, parent, user);
	},
});

export const tagsService = createTagsService(tagsRepository);
