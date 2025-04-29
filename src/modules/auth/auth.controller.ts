import type { NextFunction, Request, Response } from 'express';
import type { Types } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import type { IAuthService } from './auth.service';
import { authService } from './auth.service';

const createAuthController = (service: IAuthService) => ({
	/**
	 * Handles user registration (v1).
	 *
	 * - Receives user registration data from the request body.
	 * - Calls the service to create a new user and generate authentication tokens.
	 * - Sets a secure HTTP-only refresh token cookie.
	 * - Sends back the access token and basic user information in the response.
	 *
	 * @param {Request} req - Express request object containing the user registration data.
	 * @param {Response} res - Express response object used to send the access token and user info.
	 * @param {NextFunction} next - Express next function for error handling.
	 *
	 * @returns {Promise<void>}
	 */
	async registerV1(req: Request, res: Response, next: NextFunction) {
		try {
			const createUserDto = req.body as CreateUserDto;
			const { newUser, accessToken, refreshToken } =
				await service.registerV1(createUserDto);
			const userObject = newUser.toObject();

			res.cookie('refresh_token', refreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 23 * 60 * 60 * 1000, // slightly lower to prevent race condition
				path: '/auth/refresh',
			});

			res.sendSuccess(
				httpStatus.CREATED,
				{
					accessToken,
					user: { _id: userObject._id, email: userObject.email },
				},
				'user registered successfully',
			);
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Handles refreshing of access and refresh tokens.
	 *
	 * - Expects a `refresh_token` cookie from the client.
	 * - If no refresh token is found, responds with 401 Unauthorized.
	 * - If a valid refresh token is provided, generates a new access token and refresh token.
	 * - Sets a new `refresh_token` cookie with updated expiry and returns the new access token in the response.
	 *
	 * @async
	 * @param {Request} req - Express request object, expected to have cookies containing `refresh_token`.
	 * @param {Response} res - Express response object used to send success or error responses.
	 * @param {NextFunction} next - Express next middleware function for error handling.
	 * @returns {Promise<void>}
	 */
	async refreshTokensV1(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				res.sendError(httpStatus.UNAUTHORIZED, {
					code: 'UNAUTHORIZED',
					message: 'please login',
				});
			}

			const refreshToken = req.cookies.refresh_token;
			if (!refreshToken) {
				res.sendError(httpStatus.UNAUTHORIZED, {
					code: 'UNAUTHORIZED',
					message: 'refresh token not found',
				});
			}

			const {
				refreshToken: newRefreshToken,
				accessToken: newAccessToken,
			} = await service.refreshTokensV1(refreshToken);

			res.cookie('refresh_token', newRefreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 23 * 60 * 60 * 1000, // slightly lower to prevent race condition
				path: '/auth/refresh',
			});

			res.sendSuccess(
				httpStatus.CREATED,
				{
					accessToken: newAccessToken,
				},
				'token refreshed successfully',
			);
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Logs out the currently authenticated user by:
	 * - Invalidating all tokens associated with the user's ID.
	 * - Clearing the user's session from the request.
	 * - Removing the refresh token cookie.
	 * - Sending a success response to the client.
	 *
	 * @param {Request} req - Express request object, with `user` containing the authenticated user's info.
	 * @param {Response} res - Express response object used to send back the HTTP response.
	 * @param {NextFunction} next - Express next middleware function to pass errors if they occur.
	 */
	async logoutV1(req: Request, res: Response, next: NextFunction) {
		try {
			await service.invalidateAllTokens(req.user?._id as Types.ObjectId);
			req.user = undefined;
			res.clearCookie('refresh_token', { path: '/auth/refreshs' });
			res.sendSuccess(
				httpStatus.OK,
				{},
				'You have been logged out. please invalidate the access token !',
			);
		} catch (error) {
			next(error);
		}
	},
});

export const authController = createAuthController(authService);
