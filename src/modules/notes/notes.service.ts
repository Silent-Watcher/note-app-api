import type {
	ClientSession,
	DeleteResult,
	FilterQuery,
	PaginateResult,
	UpdateQuery,
	UpdateResult,
} from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { MongoQueryOptions } from '#app/config/db/mongo/repository';
import { tagsService } from '../tags/tags.service';
import type { Note, NoteDocument } from './notes.model';
import type { INotesRepository } from './notes.repository';
import { notesRepository } from './notes.repository';

export interface INotesService {
	getAll(
		queryOptions: MongoQueryOptions<Note, NoteDocument>,
	): Promise<PaginateResult<NoteDocument> | NoteDocument[] | []>;

	create(dto: Partial<Note>, session?: ClientSession): Promise<NoteDocument>;

	updateOne(
		filter: FilterQuery<NoteDocument>,
		changes: UpdateQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<UpdateResult>;

	updateMany(
		filter: FilterQuery<NoteDocument>,
		changes: UpdateQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<UpdateResult>;

	deleteOne(
		filter: FilterQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<DeleteResult>;
}

const createNotesService = (repo: INotesRepository) => ({
	getAll(
		queryOptions: MongoQueryOptions<Note, NoteDocument>,
	): Promise<PaginateResult<NoteDocument> | NoteDocument[] | []> {
		return repo.getAll(queryOptions);
	},

	async create(
		dto: Partial<Note>,
		session?: ClientSession,
	): Promise<NoteDocument> {
		if (dto.tags) {
			const uniqueTags = [
				...new Set(dto.tags?.map((id) => id.toString())),
			];
			const foundCount = await tagsService.countDocuments({
				_id: { $in: uniqueTags },
			});
			if (foundCount !== uniqueTags.length) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'One or more tags do not exist.',
				});
			}
			dto.tags = uniqueTags;
		}

		return repo.create(dto, session);
	},

	async updateOne(
		filter: FilterQuery<NoteDocument>,
		changes: UpdateQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		// ! validation and checks!
		return repo.updateOne(filter, changes, session);
	},

	updateMany(
		filter: FilterQuery<NoteDocument>,
		changes: UpdateQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return repo.updateMany(filter, changes, session);
	},

	deleteOne(
		filter: FilterQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<DeleteResult> {
		return repo.deleteOne(filter, session);
	},
});

export const notesService = createNotesService(notesRepository);
