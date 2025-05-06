import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { verifyWithGoolge } from '#app/common/utils/recaptcha/verifyWithGoogle';

const zCaptcha = z
	.string()
	.nonempty({ message: 'captcha token required!' })
	.min(1);

export function verifyCaptcha(action: string) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const token = req.body?.captchaToken as string;

		if (!token) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'captcha token not found',
			});
		}

		try {
			const validationResult = zCaptcha.safeParse(token);
			if (!validationResult.success) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: `[recaptcha]: ${fromZodError(
						validationResult.error,
					).toString()}`,
				});
			}

			const verificationResult = await verifyWithGoolge(
				token,
				req.ip as string,
			);

			if (!verificationResult.success) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'google captcha verification failed',
					details: {
						errorCodes: verificationResult['error-codes'],
					},
				});
			}

			const score = verificationResult.score;
			const recievedAction = verificationResult.action;

			if (recievedAction !== action) {
				throw createHttpError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'invalid captcha action!',
				});
			}

			// do something with score value!

			next();
		} catch (error) {
			next(error);
		}
	};
}
