import { Router } from 'express';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { configSwaggerV1 } from '#app/common/utils/swagger/swagger.util';
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

export default router;
