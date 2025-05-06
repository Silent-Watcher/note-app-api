import { Router } from 'express';
import type { Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { configSwaggerV1 } from '#app/common/utils/swagger/swagger.util';
import { CONFIG } from '#app/config';
import { appController } from '#app/modules/app/app.controller';
import { authRouterV1 } from '#app/modules/auth/auth.routes';

const router = Router();

/**
 * Configures Swagger documentation for API version 1.
 *
 * @param {import("express").Router} router - Express router instance to attach Swagger docs to.
 */
configSwaggerV1(router);

/**
 * Mounts the authentication routes under `/auth`.
 */
router.use('/auth', authRouterV1);

/**
 * Renders the index page for API version 1.
 */
router.get('/', appController.renderIndexPageV1);

router.get('/superman', verifyUser, (req, res, next) => {
	res.send({
		user: req.user,
	});
});

/**
 * Health check endpoint.
 *
 * Responds with a 200 OK status to indicate that the server is running and healthy.
 * This can be used for monitoring or load balancer health checks.
 */
router.get('/health', appController.checkHealth);

if (CONFIG.DEBUG) {
	router.get(
		'/dev/recaptcha',
		(req, res, next) => {
			const auth = req.get('x-dev-token') ?? req.query.key;

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
}

export default router;
