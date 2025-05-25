import { Router } from 'express';
import { tagsController } from './tags.controller';

const tagsRouterV1 = Router();

tagsRouterV1.get('/', tagsController.getAll);

export { tagsRouterV1 };
