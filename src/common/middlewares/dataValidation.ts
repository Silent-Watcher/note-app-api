import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { httpStatus } from '#app/common/helpers/httpstatus';

function validate<T, U>(schema: ZodSchema<T>, data: U, res: Response): void {
	const validationResult = schema.safeParse(data);
	if (!validationResult.success) {
		res.sendError(httpStatus.NOT_ACCEPTABLE, {
			code: 'NOT ACCEPTABLE',
			message: fromZodError(validationResult.error).toString(),
		});
		return;
	}
}

export function validateBody<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		validate(schema, req.body, res);
		next();
	};
}

export function validateParam<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		validate(schema, req.params, res);
		next();
	};
}

export function validateQuery<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		validate(schema, req.query, res);
		next();
	};
}
