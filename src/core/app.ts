import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import express from 'express';
import { router as apiRouter } from '#app/api/';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { configureErrorHandler } from '#app/common/middlewares/errorHandler';
import { extractVersion } from '#app/common/middlewares/extractVersion';
import { responseMiddleware } from '#app/common/middlewares/response';
import { CONFIG } from '#app/config';

export const app = express();

/**
 * Built-in middleware to parse incoming request bodies.
 * Must be registered before any route handlers that rely on `req.body`.
 */
app.use(express.json(), express.urlencoded({ extended: false }));

/**
 * Parses incoming request cookies and populates `req.cookies`.
 */
app.use(cookieParser(CONFIG.SECRET.COOKIE));

/**
 * Middleware to extract the API version from the incoming request.
 *
 * This allows versioning routes by reading version information from:
 * - Headers
 *
 * Must be used early, before defining any versioned routes.
 */
app.use(extractVersion());

/**
 * Middleware to extend the Response object with custom helpers.
 *
 * It adds:
 * - `res.sendSuccess(data, message, meta, statusCode)`
 * - `res.sendError(statusCode, error)`
 *
 * This ensures a consistent structure for both success and error responses.
 */
app.use(responseMiddleware);

/**
 * Mount the main API router.
 *
 * This router handles all API endpoints, typically grouped by version and feature.
 * Should be mounted after global middlewares (like extractVersion and responseMiddleware).
 */
app.use(apiRouter);

/**
 * Health check endpoint.
 *
 * Responds with a 200 OK status to indicate that the server is running and healthy.
 * This can be used for monitoring or load balancer health checks.
 */
app.get('/health', (req: Request, res: Response) => {
	res.sendSuccess(httpStatus.OK, {}, 'server is up ...');
});

configureErrorHandler(app);
