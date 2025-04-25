import express from 'express';
import type { Request, Response } from 'express';
import { router as apiRouter } from '#app/api/';
import { httpStatus } from '#app/common/helpers/httpstatus.helper';
import { extractVersion } from '#app/common/middlewares/extractVersion';

export const app = express();

app.use(extractVersion());
app.use(apiRouter);

/**
 * Health check endpoint.
 *
 * Responds with a 200 OK status to indicate that the server is running and healthy.
 * This can be used for monitoring or load balancer health checks.
 *
 * @route GET /health
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void}
 */
app.get('/health', (req: Request, res: Response) => {
	res.status(httpStatus.OK).send({
		code: res.statusCode,
		message: 'server is up ...',
		version: req.apiVersion,
	});
});
