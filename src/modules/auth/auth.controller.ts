import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import type { IAuthService } from './auth.service';
import { authService } from './auth.service';

const createAuthController = (service: IAuthService) => ({
	async registerV1(req: Request, res: Response, next: NextFunction) {
		try {
			const createUserDto = req.body as CreateUserDto;
			const newUser = (await service.register(createUserDto)).toObject();
			const userObject = newUser;
			res.sendSuccess(
				httpStatus.CREATED,
				{
					user: { _id: userObject._id, email: userObject.email },
				},
				'user registered successfully',
			);
		} catch (error) {
			next(error);
		}
	},
});

export const authController = createAuthController(authService);
