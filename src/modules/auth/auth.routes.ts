import { Router } from 'express';
import { validateBody } from '#app/common/middlewares/dataValidation';
import { zCreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { authController } from './auth.controller';

const authRouterV1 = Router();

authRouterV1.post(
	'/register',
	validateBody(zCreateUserDto),
	authController.registerV1,
);

export { authRouterV1 };
