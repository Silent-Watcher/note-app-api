import { Router } from 'express';
import { enforceTagsLimit } from '#app/common/guards/tags.guard';
import {
	validateBody,
	validateIdParam,
} from '#app/common/validation/dataValidation';
import { zCreateTagDto } from './dtos/create-tag.dto';
import { zUpdateTagDto } from './dtos/update-tag.dto';
import { tagsController } from './tags.controller';

const tagsRouterV1 = Router();

tagsRouterV1.get('/', tagsController.getAll);
tagsRouterV1.post(
	'/',
	enforceTagsLimit,
	validateBody(zCreateTagDto),
	tagsController.create,
);
tagsRouterV1.delete('/:id', validateIdParam, tagsController.deleteOne);
tagsRouterV1.put(
	'/:id',
	validateIdParam,
	validateBody(zUpdateTagDto),
	tagsController.updateOne,
);

export { tagsRouterV1 };
