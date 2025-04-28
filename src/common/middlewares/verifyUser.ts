import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { DecodedToken } from '#app/common/helpers/jwt';
import { covertToObjectId } from '#app/common/helpers/mongo';
import { CONFIG } from '#app/config';
import { userService } from '#app/modules/users/user.service';

export function verifyUser(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.sendError(httpStatus.UNAUTHORIZED, {
			code: 'UNAUTHORIZED',
			message: 'header not found',
		});
	}
	const accessToken = authHeader?.split(' ')[1];
	if (!accessToken) {
		res.sendError(httpStatus.BAD_REQUEST, {
			code: 'BAD REQUEST',
			message: 'invalid token',
		});
	}
	jwt.verify(
		accessToken as string,
		CONFIG.SECRET.ACCESS_TOKEN,
		async (err, decoded) => {
			if (err) {
				res.sendError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'invalid token',
				});
			} else {
				req.user = await userService.findById(
					covertToObjectId((decoded as DecodedToken).userId),
				);
				next();
			}
		},
	);
}
