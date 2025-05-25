import type { ClientSession, DeleteResult, Types } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { CreateTagDto } from './dtos/create-tag.dto';
import type { Tag, TagDocument } from './tags.model';
import { type ITagsRepository, tagsRepository } from './tags.repository';

export interface ITagsService {
	getAll(
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<TagDocument[] | []>;
	deleteOne(
		id: Types.ObjectId,
		session?: ClientSession,
	): Promise<DeleteResult>;
	create(
		newTag: CreateTagDto & { user: Types.ObjectId },
		session?: ClientSession,
	): Promise<TagDocument>;
}

const createTagsService = (repo: ITagsRepository) => ({
	getAll(userId: Types.ObjectId): Promise<TagDocument[] | []> {
		return repo.getAll(userId);
	},

	async create(
		newTag: CreateTagDto & { user: Types.ObjectId },
		session?: ClientSession,
	): Promise<TagDocument> {
		const { name, color, parent, user } = newTag;
		const parentExists = await repo.existsParentWithId(
			parent as Types.ObjectId,
		);

		if (!parentExists) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'parent tag with given id not found',
			});
		}

		return repo.create(
			name,
			color,
			parent as Types.ObjectId,
			user as Types.ObjectId,
		);
	},

	deleteOne(
		id: Types.ObjectId,
		session?: ClientSession,
	): Promise<DeleteResult> {
		return repo.deleteOne(id);
	},
});

export const tagsService = createTagsService(tagsRepository);
