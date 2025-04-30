import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { DecodedToken } from '#app/common/helpers/jwt';
import { covertToObjectId } from '#app/common/helpers/mongo';
import { CONFIG } from '#app/config';
import type { UserDocument } from '#app/modules/users/user.model';
import { userService } from '#app/modules/users/user.service';

/**
 * Middleware to verify the user based on the JWT access token.
 *
 * This function checks the Authorization header for a valid JWT token, verifies it, and retrieves the associated
 * user document from the database. If successful, the user document is attached to the `req.user` property for use in
 * subsequent middleware or route handlers. If any errors occur (e.g., missing or invalid token), an appropriate error
 * response is sent.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The callback function to pass control to the next middleware.
 *
 * @returns void - The function doesn't return a value; instead, it either calls `next()` to proceed or sends an error response.
 *
 * @throws Sends a standardized error response with:
 *   - HTTP status `401 Unauthorized` for missing or invalid authorization headers.
 *   - HTTP status `400 Bad Request` for invalid tokens.
 */
export function verifyUser(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.sendError(httpStatus.FORBIDDEN, {
			code: 'FORBIDDEN',
			message: 'authorization header not found',
		});
		return;
	}
	const accessToken = authHeader?.split(' ')[1];

	if (!accessToken) {
		res.sendError(httpStatus.FORBIDDEN, {
			code: 'FORBIDDEN',
			message: 'access token not found!',
		});
		return;
	}

	// In development mode (e.g., when testing via Postman), if the placeholder access token "{{access_token}}"
	// is sent instead of a real token, block the request with a 403 Forbidden error.
	if (CONFIG.DEBUG && accessToken === '{{access_token}}') {
		res.sendError(httpStatus.FORBIDDEN, {
			code: 'FORBIDDEN',
			message: 'access token not found!',
		});
		return;
	}

	jwt.verify(
		accessToken as string,
		CONFIG.SECRET.ACCESS_TOKEN,
		async (err, decoded) => {
			if (err instanceof jwt.TokenExpiredError) {
				res.sendError(httpStatus.UNAUTHORIZED, {
					code: 'UNAUTHORIZED',
					message:
						'your token expired refresh it or login if your session expired!',
				});
				return;
			}

			if (err instanceof jwt.JsonWebTokenError) {
				res.sendError(httpStatus.FORBIDDEN, {
					code: 'FORBIDDEN',
					message: 'invalid token!',
				});
				return;
			}

			const user = await userService.findById(
				covertToObjectId((decoded as DecodedToken).userId),
			);
			req.user = user.toObject() as UserDocument;
			next();
		},
	);
}
