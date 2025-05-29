import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import type { ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { httpStatus } from '#app/common/helpers/httpstatus';

/**
 * Validates data against a provided Zod schema.
 *
 * This function uses Zod's `safeParse` method to validate the provided data. If the validation fails, it sends a
 * standardized error response with a detailed validation error message.
 *
 * @param schema - The Zod schema to validate the data against.
 * @param data - The data to validate (could be from `req.body`, `req.params`, or `req.query`).
 * @param res - The Express response object used to send an error response if validation fails.
 *
 * @returns `true` if validation is successful, otherwise `false` and sends an error response.
 */
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

/**
 * Middleware to validate the body of the request against a Zod schema.
 *
 * This function validates the request body and sends a 406 Not Acceptable error response if the validation fails.
 *
 * @param schema - The Zod schema to validate the request body against.
 *
 * @returns A middleware function that validates `req.body`.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = validate(schema, req.body, res);
		result ? next() : undefined;
	};
}

/**
 * Middleware to validate the parameters of the request against a Zod schema.
 *
 * This function validates the request parameters (from `req.params`) and sends a 406 Not Acceptable error response
 * if the validation fails.
 *
 * @param schema - The Zod schema to validate the request parameters against.
 *
 * @returns A middleware function that validates `req.params`.
 */
export function validateParam<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = validate(schema, req.params, res);
		result ? next() : undefined;
	};
}

/**
 * Middleware to validate the query parameters of the request against a Zod schema.
 *
 * This function validates the request query parameters (from `req.query`) and sends a 406 Not Acceptable error response
 * if the validation fails.
 *
 * @param schema - The Zod schema to validate the request query parameters against.
 *
 * @returns A middleware function that validates `req.query`.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = validate(schema, req.query, res);
		result ? next() : undefined;
	};
}

export function validateIdParam(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const id = req.params.id;
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		res.sendError(httpStatus.BAD_REQUEST, {
			code: 'BAD REQUEST',
			message: 'invalid identifier',
		});
		return;
	}
	next();
}
