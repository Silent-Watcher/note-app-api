import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import type { IAuthService } from './auth.service';
import { authService } from './auth.service';

const createAuthController = (service: IAuthService) => ({
	async registerV1(req: Request, res: Response, next: NextFunction) {
		try {
			const createUserDto = req.body as CreateUserDto;
			const { newUser, accessToken, refreshToken } =
				await service.registerV1(createUserDto);
			const userObject = newUser.toObject();

			res.cookie('refresh_token', refreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 23 * 60 * 60 * 1000, // slightly lower to prevent race condition
				path: '/refresh',
			});

			res.sendSuccess(
				httpStatus.CREATED,
				{
					accessToken,
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
