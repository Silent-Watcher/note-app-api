import { Router } from 'express';
import { appController } from './app.controller';

const appRouterV1 = Router();

/**
 * Renders the index page for API version 1.
 */
appRouterV1.get('/', appController.renderIndexPageV1);

/**
 * Health check endpoint.
 *
 * Responds with a 200 OK status to indicate that the server is running and healthy.
 * This can be used for monitoring or load balancer health checks.
 */
appRouterV1.get('/health', appController.checkHealth);

export { appRouterV1 };
