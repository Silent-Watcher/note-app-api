import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '#app/config';
import { httpStatus } from '../helpers/httpstatus';

/**
 * Middleware that blocks access to a route if the user is already authenticated.
 *
 * This is typically used on routes like `/login` or `/register` where authenticated users
 * should not be allowed to perform the action again. It checks for the presence of an
 * access token in the `Authorization` header, and verifies it. If the token is valid,
 * the request is rejected with a 403 Forbidden error. If there is no token or it's invalid,
 * the request proceeds.
 *
 * @function blockIfAuthenticated
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (extended with `sendError`)
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export function blockIfAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const accessToken = req.headers.authorization?.split(' ')[1];

	if (!accessToken)
		next(); // no token, so not logged in → allow
	else {
		try {
			jwt.verify(accessToken as string, CONFIG.SECRET.ACCESS_TOKEN);
			// Token is valid → block access
			res.sendError(httpStatus.FORBIDDEN, {
				code: 'FORBIDDEN',
				message:
					'Authenticated users cannot access the login or register endpoints.',
			});
			return;
		} catch (error) {
			// expired token?
			if (error instanceof jwt.TokenExpiredError) {
				next();
				return;
			}
			// malformed / bad token?
			if (error instanceof jwt.JsonWebTokenError) {
				next();
				return;
			}
			// other unexpected errors → propagate
			next(error);
		}
	}
}
