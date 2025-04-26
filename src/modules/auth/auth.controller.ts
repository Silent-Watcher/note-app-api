import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus.helper';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { authService } from './auth.service';
import type { IAuthService } from './auth.service';

const createAuthController = (service: IAuthService) => ({
	async registerV1(req: Request, res: Response, next: NextFunction) {
		try {
			const createUserDto = req.body as CreateUserDto;
			const newUser = await service.register(createUserDto);
			res.status(httpStatus.CREATED).send(newUser);
		} catch (error) {
			console.log(error);
			next(error);
		}
	},
});

export const authController = createAuthController(authService);
