import dayjs from 'dayjs';
import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { MONGO_STATE_MAP, mongoState } from '#app/config/db/mongo.condig';
import { REDIS_STATE_MAP, redisState } from '#app/config/db/redis.config';
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
			const mongoStatus = MONGO_STATE_MAP[mongoState];

			res.sendSuccess(httpStatus.OK, {}, 'Health report', {
				server: {
					status: 'OK',
				},
				mongo: {
					status: mongoStatus,
				},
				redis: {
					clientStatus: REDIS_STATE_MAP[redisState],
				},
				timestamp: dayjs().toISOString(),
			});
		} catch (error) {
			next(error);
		}
	},
});

export const appController = createAppController(appService);
