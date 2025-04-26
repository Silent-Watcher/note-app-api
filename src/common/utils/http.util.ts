import type { HttpStatusCode } from '#app/common/helpers/httpstatus';

export type HttpErrorDetails = {
	code?: string;
	message?: string;
	details?: unknown;
};

export class HttpError extends Error {
	public status: HttpStatusCode;
	public error: HttpErrorDetails;

	constructor(status: HttpStatusCode, error: HttpErrorDetails) {
		super(error.message);
		this.status = status;
		this.error = error;
	}
}

export function createHttpError(
	statusCode: HttpStatusCode,
	error: HttpErrorDetails,
): HttpError {
	return new HttpError(statusCode, error);
}
