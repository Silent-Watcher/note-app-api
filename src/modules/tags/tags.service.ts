import type {
	ClientSession,
	DeleteResult,
	FilterQuery,
	UpdateResult,
} from 'mongoose';
import mongoose from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { ID } from '#app/config/db/mongo/types';
import type { CreateTagDto } from './dtos/create-tag.dto';
import type { Tag, TagDocument } from './tags.model';
import { type ITagsRepository, tagsRepository } from './tags.repository';

export interface ITagsService {
	getAll(userId: ID): Promise<TagDocument[] | []>;
	deleteOne(id: ID): Promise<DeleteResult>;
	create(newTag: CreateTagDto & { user: ID }): Promise<TagDocument>;
	updateOne(id: ID, changes: Partial<Tag>): Promise<UpdateResult>;
	countDocuments(
		filter: FilterQuery<TagDocument>,
		session?: ClientSession,
	): Promise<number>;
}

const createTagsService = (repo: ITagsRepository) => ({
	getAll(userId: ID): Promise<TagDocument[] | []> {
		return repo.getAll(userId);
	},

	async create(newTag: CreateTagDto & { user: ID }): Promise<TagDocument> {
		const { name, color, parent, user } = newTag;

		if (parent) {
			const result = await repo.isExists({
				_id: parent,
				parent: { $exists: false },
				user,
			});

			if (!result) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'parent tag with given id not found',
				});
			}
		}

		const nameExists = await repo.isExists({ name, user });

		if (nameExists) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: `tag with given name : "${name}" already exists`,
			});
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

	async updateOne(id: ID, changes: Partial<Tag>): Promise<UpdateResult> {
		if (changes?.name) {
			const result = await repo.isExists({ _id: id, name: changes.name });
			if (result) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'This tag name already exists',
				});
			}
		}

		if (changes?.parent) {
			const result = await repo.isExists({
				_id: parent,
				parent: { $exists: false },
			});
			if (!result) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'parent tag not found',
				});
			}
		}

		// ! later validation for pinned status
		return repo.updateOne(id, changes);
	},

	countDocuments(
		filter: FilterQuery<TagDocument>,
		session?: ClientSession,
	): Promise<number> {
		return repo.countDocuments(filter, session);
	},
});

export const tagsService = createTagsService(tagsRepository);
