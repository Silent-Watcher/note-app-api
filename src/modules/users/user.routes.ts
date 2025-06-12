import { Router } from 'express';
import multer from 'multer';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { validateIdParam } from '#app/common/validation/dataValidation';
import { userController } from './user.controller';

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 ** 2 },
});

const userRouterV1 = Router();

userRouterV1.get('/', verifyUser, userController.whoamI);

userRouterV1.patch(
	'/:id',
	verifyUser,
	upload.single('avatar'),
	userController.updateOne,
);

export { userRouterV1 };
