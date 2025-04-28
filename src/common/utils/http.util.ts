import type { HttpStatusCode } from '#app/common/helpers/httpstatus';

/**
 * Type definition for the details of an HTTP error.
 *
 * Includes optional fields for:
 * - `code`: A custom error code representing the error type.
 * - `message`: A human-readable message describing the error.
 * - `details`: Additional details or context about the error.
 */
export type HttpErrorDetails = {
	code?: string;
	message?: string;
	details?: unknown;
};

/**
 * Custom Error class representing an HTTP error with a status code and error details.
 *
 * This class extends the built-in JavaScript `Error` class and adds two additional properties:
 * - `status`: The HTTP status code associated with the error.
 * - `error`: An object containing details about the error.
 *
 * @example
 * throw new HttpError(400, { code: 'BAD_REQUEST', message: 'Invalid input data' });
 */
export class HttpError extends Error {
	public status: HttpStatusCode;
	public error: HttpErrorDetails;

	constructor(status: HttpStatusCode, error: HttpErrorDetails) {
		super(error.message);
		this.status = status;
		this.error = error;
	}
}

/**
 * Factory function for creating an `HttpError` instance.
 *
 * This utility function allows you to quickly create a new HTTP error with the specified status code and error details.
 *
 * @param {HttpStatusCode} statusCode - The HTTP status code associated with the error.
 * @param {HttpErrorDetails} error - The details of the error.
 * @returns {HttpError} A new instance of the `HttpError` class.
 */
export function createHttpError(
	statusCode: HttpStatusCode,
	error: HttpErrorDetails,
): HttpError {
	return new HttpError(statusCode, error);
}
