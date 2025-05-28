import { Router } from 'express';
import {
	validateBody,
	validateIdParam,
	validateQuery,
} from '#app/common/validation/dataValidation';
import { zCreateNotesDto } from './dtos/create-note.dto';
import { zUpdateNotesDto } from './dtos/update-note-dto';
import { notesController } from './notes.controller';
import { zNotesQuerySchema } from './notes.query';

const notesRouterV1 = Router();

notesRouterV1.get(
	'/',
	validateQuery(zNotesQuerySchema),
	notesController.getAll,
);

notesRouterV1.post('/', validateBody(zCreateNotesDto), notesController.create);

notesRouterV1.put(
	'/:id',
	validateIdParam,
	validateBody(zUpdateNotesDto),
	notesController.updateOne,
);

notesRouterV1.delete('/:id', validateIdParam, notesController.deleteOne);

export { notesRouterV1 };
