import type {
	ClientSession,
	DeleteResult,
	FilterQuery,
	PaginateResult,
	Types,
	UpdateQuery,
	UpdateResult,
} from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { MongoQueryOptions } from '#app/config/db/mongo/repository';
import type { ID } from '#app/config/db/mongo/types';
import { tagsService } from '../tags/tags.service';
import type { CreateNotesDto } from './dtos/create-note.dto';
import type { Note, NoteDocument } from './notes.model';
import type { INotesRepository } from './notes.repository';
import { notesRepository } from './notes.repository';

export interface INotesService {
	getAll(
		queryOptions: MongoQueryOptions<Note, NoteDocument>,
	): Promise<PaginateResult<NoteDocument> | NoteDocument[] | []>;

	create(
		data: CreateNotesDto & { user: ID },
		session?: ClientSession,
	): Promise<NoteDocument>;

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
		data: CreateNotesDto & { user: ID },
		session?: ClientSession,
	): Promise<NoteDocument> {
		if (data.tags) {
			const uniqueTags = [
				...new Set(data.tags?.map((id) => id.toString())),
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
			data.tags = uniqueTags;
		}

		return repo.create(data);
	},

	async updateOne(
		filter: FilterQuery<NoteDocument>,
		changes: UpdateQuery<NoteDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		// ! validation and checks!
		return repo.updateOne(filter, changes);
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
		return repo.deleteOne(filter);
	},
});

export const notesService = createNotesService(notesRepository);
