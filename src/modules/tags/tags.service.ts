import type { ClientSession, DeleteResult, Types } from 'mongoose';
import mongoose from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { ID } from '#app/config/db/mongo.condig';
import type { CreateTagDto } from './dtos/create-tag.dto';
import type { Tag, TagDocument } from './tags.model';
import { type ITagsRepository, tagsRepository } from './tags.repository';

export interface ITagsService {
	getAll(userId: ID): Promise<TagDocument[] | []>;
	deleteOne(id: ID): Promise<DeleteResult>;
	create(newTag: CreateTagDto & { user: ID }): Promise<TagDocument>;
}

const createTagsService = (repo: ITagsRepository) => ({
	getAll(userId: ID): Promise<TagDocument[] | []> {
		return repo.getAll(userId);
	},

	async create(newTag: CreateTagDto & { user: ID }): Promise<TagDocument> {
		const { name, color, parent, user } = newTag;

		if (parent) {
			const parentExists = await repo.existsParentWithId(parent);

			if (!parentExists) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'parent tag with given id not found',
				});
			}
		}

		return repo.create(name, color, user, parent);
	},

	async deleteOne(id: ID): Promise<DeleteResult> {
		const session = await mongoose.startSession();
		try {
			session.startTransaction();
			//! REMOVE THE TAG FROM ALL OF THE NOTES THAT CONTAIN THIS
			await repo.updateMany({ parent: id }, { parent: null });
			const result = await repo.deleteOne(id, session);
			session.commitTransaction();
			await session.endSession();
			return result;
		} catch (error) {
			session.abortTransaction();
			await session.endSession();
			throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
				code: 'INTERNAL SERVER ERROR',
				message: 'transaction failed',
			});
		}
	},
});

export const tagsService = createTagsService(tagsRepository);
