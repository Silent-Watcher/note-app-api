import { Router } from 'express';
import { validateQuery } from '#app/common/middlewares/dataValidation';
import { notesController } from './notes.controller';
import { zNotesQuerySchema } from './notes.query';

const notesRouterV1 = Router();

notesRouterV1.get(
	'/',
	validateQuery(zNotesQuerySchema),
	notesController.getAll,
);

export { notesRouterV1 };
