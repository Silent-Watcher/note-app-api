import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { httpStatus } from '#app/common/helpers/httpstatus';

function validate<T, U>(schema: ZodSchema<T>, data: U, res: Response): boolean {
	const validationResult = schema.safeParse(data);
	if (!validationResult.success) {
		res.sendError(httpStatus.NOT_ACCEPTABLE, {
			code: 'NOT ACCEPTABLE',
			message: fromZodError(validationResult.error).toString(),
		});
		return false;
	}
	return true;
}

export function validateBody<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = validate(schema, req.body, res);
		result ? next() : undefined;
	};
}

export function validateParam<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = validate(schema, req.params, res);
		result ? next() : undefined;
	};
}

export function validateQuery<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = validate(schema, req.query, res);
		result ? next() : undefined;
	};
}
