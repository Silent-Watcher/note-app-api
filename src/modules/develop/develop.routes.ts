import { Router } from 'express';
import type { Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { CONFIG } from '#app/config';

const developRouterV1 = Router();

developRouterV1.get(
	'/recaptcha',
	(req, res, next) => {
		const auth = req.query.key;

		if (!auth || auth !== CONFIG.RECAPTCHA.DEV_AUTH) {
			res.sendError(httpStatus.UNAUTHORIZED, {
				code: 'UNAUTHORIZED',
				message: 'you are not allowed!',
			});
			return;
		}
		next();
	},
	(req: Request, res: Response) => {
		res.render('dev-recaptcha', {
			SITE_KEY: CONFIG.RECAPTCHA.SITE_KEY,
			apiVersion: req.apiVersion,
		});
	},
);

export { developRouterV1 };
