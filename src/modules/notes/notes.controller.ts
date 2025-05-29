import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { ID } from '#app/config/db/mongo/types';
import type { CreateNotesDto } from './dtos/create-note.dto';
import type { UpdateNotesDto } from './dtos/update-note-dto';
import type { NotesQuerySchema } from './notes.query';
import type { INotesService } from './notes.service';
import { notesService } from './notes.service';

const createNotesController = (service: INotesService) => ({
	async getAll(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { page, pageSize } = req.query as NotesQuerySchema;

			const notes = await service.getAll({
				filter: { user: req.user?._id },
				...(page && pageSize ? { pagination: { page, pageSize } } : {}),
				projection: { title: 1, body: 1 },
			});

			res.sendSuccess(httpStatus.OK, { notes });
			return;
		} catch (error) {
			next(error);
		}
	},

	async create(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const newNoteDto = req.body as CreateNotesDto;
			const newNote = await service.create({
				user: req.user?._id as ID,
				...newNoteDto,
			});
			if (!newNote) {
				res.sendError(httpStatus.INTERNAL_SERVER_ERROR, {
					code: 'INTERNAL SERVER ERROR',
					message: 'failed to create note try again',
				});
			}

			res.sendSuccess(httpStatus.CREATED, { note: newNote });
			return;
		} catch (error) {
			next(error);
		}
	},

	async updateOne(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const noteId = req.params?.id;

			const updateNoteDto = req.body as UpdateNotesDto;

			const { modifiedCount } = await service.updateOne(
				{
					_id: noteId,
					user: req.user?._id,
				},
				updateNoteDto,
			);

			if (!modifiedCount) {
				res.sendError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'note with this id not found',
				});
				return;
			}

			res.sendSuccess(httpStatus.OK, {}, 'updated successfully');
			return;
		} catch (error) {
			next(error);
		}
	},

	async deleteOne(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const noteId = req.params?.id;
			const { deletedCount } = await service.deleteOne({
				_id: noteId,
				user: req.user?._id,
			});

			if (!deletedCount) {
				res.sendError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'delete process failed',
				});
				return;
			}

			res.sendSuccess(httpStatus.OK, {}, 'deleted successfully');
			return;
		} catch (error) {
			next(error);
		}
	},
});

export const notesController = createNotesController(notesService);
