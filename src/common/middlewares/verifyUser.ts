import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { httpStatus } from '#app/common/helpers/httpstatus';
import {
	type DecodedToken,
	fetchTokenFromTheHeader,
} from '#app/common/helpers/jwt';
import { covertToObjectId } from '#app/common/helpers/mongo';
import { CONFIG } from '#app/config';
import type { UserDocument } from '#app/modules/users/user.model';
import { userService } from '#app/modules/users/user.service';

export function verifyUser(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const accessToken = fetchTokenFromTheHeader(req);

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
					message: 'invalid credentials!',
				});
				return;
			}

			const user = await userService.findById(
				(decoded as DecodedToken).userId,
				{ password: 0 },
				true,
			);

			if (!user) {
				res.sendError(httpStatus.FORBIDDEN, {
					code: 'FORBIDDEN',
					message: 'invalid credentials!',
				});
				return;
			}

			req.user = user;
			next();
		},
	);
}
