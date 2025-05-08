import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { rawRedis, redis } from '#app/config/db/redis.config';
import { type IAppService, appService } from './app.service';

const createAppController = (service: IAppService) => ({
	renderIndexPageV1(req: Request, res: Response, next: NextFunction): void {
		res.render('index', { apiVersion: req.apiVersion });
	},

	async checkHealth(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			res.sendSuccess(httpStatus.OK, {}, 'server is up ...');
		} catch (error) {
			next(error);
		}
	},
});

export const appController = createAppController(appService);
