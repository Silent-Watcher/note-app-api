import { Router } from 'express';
import { validateBody } from '#app/common/middlewares/dataValidation';
import { zCreateTagDto } from './dtos/create-tag.dto';
import { tagsController } from './tags.controller';

const tagsRouterV1 = Router();

tagsRouterV1.get('/', tagsController.getAll);

tagsRouterV1.post('/', validateBody(zCreateTagDto), tagsController.create);

export { tagsRouterV1 };
