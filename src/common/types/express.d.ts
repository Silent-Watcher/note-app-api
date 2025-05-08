import type { HttpStatusCode } from '#app/common/helpers/httpstatus';
import type { HttpErrorDetails } from '#app/common/utils/http.util';
import type { UserDocument } from '#app/modules/users/user.model';
import 'express-serve-static-core';
import type Redis from 'ioredis';

declare module 'express-serve-static-core' {
	/**
	 * Extend the Express `Request` object to include additional properties.
	 */
	interface Request {
		/**
		 * Optional API version header for versioning the API.
		 *
		 * This field can be used to determine which version of the API the request is targeting.
		 */
		apiVersion?: string;

		/**
		 * The authenticated user document.
		 *
		 * This property holds the `UserDocument` associated with the current authenticated user, typically set after
		 * the user has been validated via a token or session.
		 */
		user?: UserDocument;

		/**
		 * A singleton Redis client attached to the request.
		 *
		 * Initialized via middleware and used for caching, session, etc.
		 */
		redis: Redis;
	}

	/**
	 * Extend the Express `Response` object to include helper methods for sending standardized responses.
	 */
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
