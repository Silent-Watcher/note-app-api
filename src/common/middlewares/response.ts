import type { NextFunction, Request, Response } from 'express';
import type { HttpStatusCode } from '#app/common/helpers/httpstatus';
import type { HttpErrorDetails } from '#app/common/utils/http.util';

/**
 * Middleware to extend the Response object with custom helper methods for API responses.
 *
 * Adds two methods to `res`:
 *
 * - `res.sendSuccess(status, data, message, meta)`
 *   - Sends a success response with a consistent structure.
 *   - Includes: HTTP status code, message, data, metadata, and API version.
 *
 * - `res.sendError(status, error)`
 *   - Sends an error response with a consistent structure.
 *   - Includes: HTTP status code, detailed error information, and API version.
 *
 * This ensures that all responses across the API follow a unified format.
 *
 * @param {Request} req - The incoming Express request object.
 * @param {Response} res - The outgoing Express response object, extended with `sendSuccess` and `sendError`.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export function responseMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	res.sendSuccess = (
		status: HttpStatusCode,
		data,
		message,
		meta = {},
	): Express.Response => {
		return res.status(status).send({
			code: res.statusCode,
			message,
			data,
			meta,
			version: req.apiVersion as string,
		});
	};

	res.sendError = (
		status: HttpStatusCode,
		error: HttpErrorDetails,
	): Express.Response => {
		return res.status(status).send({
			code: res.statusCode,
			error,
			version: req.apiVersion as string,
		});
	};

	next();
}
