import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
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
				pagination: { page, pageSize },
				projection: { title: 1, body: 1 },
			});

			res.sendSuccess(httpStatus.OK, { notes });
			return;
		} catch (error) {
			next(error);
		}
	},
});

export const notesController = createNotesController(notesService);
