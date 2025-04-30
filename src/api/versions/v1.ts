import { Router } from 'express';
import type { Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { configSwaggerV1 } from '#app/common/utils/swagger/swagger.util';
import { authRouterV1 } from '#app/modules/auth/auth.routes';

const router = Router();

configSwaggerV1(router);

router.get('/', (req, res, next) => {
	res.render('index', { apiVersion: req.apiVersion });
});

router.use('/auth', authRouterV1);

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
router.get('/health', (req: Request, res: Response) => {
	res.sendSuccess(httpStatus.OK, {}, 'server is up ...');
});

export default router;
