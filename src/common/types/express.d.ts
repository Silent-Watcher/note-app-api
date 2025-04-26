import type { HttpStatusCode } from '#app/common/helpers/httpstatus';
import type { HttpErrorDetails } from '#app/common/utils/http.util';
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
	interface Request {
		apiVersion?: string;
	}

	interface Response {
		/**
		 * Send a standardized success payload.
		 * @param data     — response body
		 * @param message  — short status message
		 * @param meta     — any extra metadata
		 * @param status   — HTTP status code from our enum
		 */
		sendSuccess<T = unknown>(
			status: HttpStatusCode,
			data?: T,
			message?: string,
			meta?: Record<string, unknown>,
		): Express.Response;

		/**
		 * Send a standardized error payload.
		 * @param err      — must have at least { message?: string }
		 * @param status   — HTTP status code from our enum
		 */
		sendError(
			status?: HttpStatusCode,
			err?: HttpErrorDetails,
		): Express.Response;
	}
}
