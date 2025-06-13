import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '#app/config';
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
