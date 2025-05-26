import { Router } from 'express';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { configSwaggerV1 } from '#app/common/utils/swagger/swagger.util';
import { adminRouterV1 } from '#app/modules/admin/admin.routes';
import { appRouterV1 } from '#app/modules/app/app.routes';
import { developRouterV1 } from '#app/modules/develop/develop.routes';

const router = Router();

/**
 * Configures Swagger documentation for API version 1.
 */
configSwaggerV1(router);

/**
 * Mounts the main app routes under `/`.
 */
router.use('/', appRouterV1);

/**
 * Mounts the admin panel routes under `/superman`.
 */
router.use('/superman', verifyUser, adminRouterV1);

/**
 * Mounts the develoment panel routes under `/dev`.
 */
router.use('/dev', developRouterV1);

export default router;
