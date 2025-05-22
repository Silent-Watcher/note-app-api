import type { Application, NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { CONFIG } from '#app/config';
import { HttpError } from '../../utils/http.util';

const { DEBUG } = CONFIG;

/**
 * Global exception handler middleware.
 *
 * Handles different types of thrown errors and sends a structured error response:
 * - If the error is an instance of `HttpError`, it sends the error with its provided status and details.
 * - If the error is a generic `Error`, it sends a 500 Internal Server Error with either full details (in DEBUG mode) or a generic message.
 *
 * Always ensures that the client receives a consistent error structure.
 *
 * @param {unknown} err - The error thrown during request processing.
 * @param {Request} _req - The Express request object (unused in this handler).
 * @param {Response} res - The Express response object, extended with `sendError`.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
function handleExceptions(
	err: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (err) {
		if (err instanceof HttpError) {
			res.sendError(err.status, err.error);
			return;
		}
		if (err instanceof Error) {
			res.sendError(
				httpStatus.INTERNAL_SERVER_ERROR,
				DEBUG
					? { message: err.message }
					: { message: 'An Server Error Occured' },
			);
			return;
		}
	}
	next();
}

/**
 * 404 Not Found handler middleware.
 *
 * Catches all unmatched routes and sends a structured 404 error response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object, extended with `sendError`.
 * @param {NextFunction} _next - The next middleware function (unused in this handler).
 */
function handleNotFoundError(
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	res.sendError(httpStatus.NOT_FOUND, {
		code: 'NOT FOUND',
		message: `${req.method}:${req.path} not found`,
	});
	return;
}

/**
 * Registers the global error handling middlewares into the Express application.
 *
 * - `handleExceptions`: Catches and processes all thrown errors.
 * - `handleNotFoundError`: Handles 404 "Not Found" errors for unmatched routes.
 *
 * Must be called after all route definitions.
 *
 * @param {Application} app - The Express application instance.
 */
export function configureErrorHandler(app: Application): void {
	app.use(handleExceptions);
	app.use(handleNotFoundError);
}
