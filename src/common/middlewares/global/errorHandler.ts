import type { Application, NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { HttpError } from '#app/common/utils/http.util';
import { CONFIG } from '#app/config';

const { DEBUG } = CONFIG;

function handleExceptions(
	err: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (err) {
		if (err instanceof HttpError) {
			res?.sendError(err.status, err.error);
			return;
		}
		if (err instanceof Error) {
			res?.sendError(
				httpStatus.INTERNAL_SERVER_ERROR,
				DEBUG
					? { message: err.message }
					: { message: 'An Server Error Occured' },
			);
			return;
		}
		res?.sendError(httpStatus.INTERNAL_SERVER_ERROR, {
			code: 'INTERNAL SERVER ERROR',
			message: 'an error occured',
		});
		return;
	}
	next();
}

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

export function configureErrorHandler(app: Application): void {
	app.use(handleExceptions);
	app.use(handleNotFoundError);
}
