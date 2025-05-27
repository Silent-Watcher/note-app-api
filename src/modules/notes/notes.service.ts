import type { PaginateResult } from 'mongoose';
import type { MongoQueryOptions } from '#app/config/db/repository';
import type { ID } from '#app/config/db/types';
import type { Note, NoteDocument } from './notes.model';
import type { INotesRepository } from './notes.repository';
import { notesRepository } from './notes.repository';

export interface INotesService {
	getAll(
		queryOptions: MongoQueryOptions<Note, NoteDocument>,
	): Promise<PaginateResult<NoteDocument>>;
}

const createNotesService = (repo: INotesRepository) => ({
	getAll(
		queryOptions: MongoQueryOptions<Note, NoteDocument>,
	): Promise<PaginateResult<NoteDocument>> {
		return repo.getAll(queryOptions);
	},
});

export const notesService = createNotesService(notesRepository);
