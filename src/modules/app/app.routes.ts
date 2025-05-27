import { Router } from 'express';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { authRouterV1 } from '../auth/auth.routes';
import { notesRouterV1 } from '../notes/notes.routes';
import { tagsRouterV1 } from '../tags/tags.routes';
import { appController } from './app.controller';

const appRouterV1 = Router();

/**
 * Health check endpoint.
 *
 * Responds with a 200 OK status to indicate that the server is running and healthy.
 * This can be used for monitoring or load balancer health checks.
 */
appRouterV1.get('/health', appController.checkHealth);

/**
 * Renders the index page for API version 1.
 */
appRouterV1.get('/', appController.renderIndexPageV1);

/**
 * Mounts the authentication routes under `/auth`.
 */
appRouterV1.use('/auth', authRouterV1);

appRouterV1.use('/tags', verifyUser, tagsRouterV1);

appRouterV1.use('/notes', verifyUser, notesRouterV1);

export { appRouterV1 };
