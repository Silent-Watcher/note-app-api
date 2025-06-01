import { Router } from 'express';
import { cache } from '#app/common/utils/cache/cache.util';
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
	cache(),
	notesController.getAll,
);

notesRouterV1.post('/', validateBody(zCreateNotesDto), notesController.create);

notesRouterV1
	.route('/:id')
	.all(validateIdParam)
	.delete(notesController.deleteOne)
	.put(validateBody(zUpdateNotesDto), notesController.updateOne);

export { notesRouterV1 };
