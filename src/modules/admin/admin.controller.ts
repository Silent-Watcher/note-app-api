import type { NextFunction, Request, Response } from 'express';
import { type IAdminService, adminService } from './admin.service';

const createAdminController = (service: IAdminService) => ({
	index(req: Request, res: Response, next: NextFunction) {
		try {
			res.send({
				message: 'haha',
				user: req.user,
			});
		} catch (error) {
			next(error);
		}
	},
});

export const adminController = createAdminController(adminService);
