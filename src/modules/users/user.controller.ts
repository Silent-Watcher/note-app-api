import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { type IUserService, userService } from './user.service';

const createUserController = (service: IUserService) => ({
	async whoamI(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const user = await service.findById(id as string);
			if (!user) {
				res.sendError(httpStatus.NOT_FOUND, {
					code: 'NOT FOUND',
					message: 'user not found',
				});
				return;
			}
			res.sendSuccess(httpStatus.OK, { user });
			return;
		} catch (error) {
			next(error);
		}
	},
});

export const userController = createUserController(userService);
