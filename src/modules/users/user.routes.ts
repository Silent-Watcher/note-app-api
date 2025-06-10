import { Router } from 'express';
import { validateIdParam } from '#app/common/validation/dataValidation';
import { userController } from './user.controller';

const userRouterV1 = Router();

userRouterV1.get('/:id', validateIdParam, userController.whoamI);

export { userRouterV1 };
