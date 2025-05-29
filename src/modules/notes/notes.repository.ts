import { createBaseRepository } from '#app/config/db/mongo/repository';
import { type Note, type NoteDocument, noteModel } from './notes.model';

export interface INotesRepository
	extends ReturnType<typeof createBaseRepository<Note, NoteDocument>> {}

const base = createBaseRepository<Note, NoteDocument>(noteModel);

const createNotesRepository = () => ({
	...base,
});

export const notesRepository = createNotesRepository();
