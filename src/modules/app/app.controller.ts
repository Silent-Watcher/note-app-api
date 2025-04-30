import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { type IAppService, appService } from './app.service';

const createAppController = (service: IAppService) => ({
	renderIndexPageV1(req: Request, res: Response, next: NextFunction): void {
		res.render('index', { apiVersion: req.apiVersion });
	},

	checkHealth(req: Request, res: Response, next: NextFunction): void {
		res.sendSuccess(httpStatus.OK, {}, 'server is up ...');
	},
});

export const appController = createAppController(appService);
