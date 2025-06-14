import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '#app/config';
import { createHttpError } from '../utils/http.util';
import { httpStatus } from './httpstatus';
export interface DecodedToken extends jwt.JwtPayload {
	userId: string;
	githubId: string;
}

export function issueToken(
	payload: string | Buffer | object,
	secret: string,
	options: jwt.SignOptions,
): string {
	return jwt.sign(payload, secret, options);
}

export function sendRefreshTokenCookie(token: string, res: Response): void {
	res.cookie('refresh_token', token, {
		httpOnly: true,
		secure: !CONFIG.DEBUG,
		sameSite: 'strict',
		maxAge: 23 * 60 * 60 * 1000, // slightly lower to prevent race condition
		path: '/api/auth/refresh',
	});
	return;
}

export function fetchTokenFromTheHeader(req: Request): string {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		throw createHttpError(httpStatus.FORBIDDEN, {
			code: 'FORBIDDEN',
			message: 'authorization header not found',
		});
	}
	const token = authHeader?.split(' ')[1];

	if (!token) {
		throw createHttpError(httpStatus.FORBIDDEN, {
			code: 'FORBIDDEN',
			message: 'token not found!',
		});
	}

	return token;
}
