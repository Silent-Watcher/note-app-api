import type { NextFunction, Request, Response } from 'express';
import type { Types } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { mailGenerator } from '#app/common/helpers/mailgen';
import { sendMail } from '#app/common/utils/email';
import { generatePasswordResetEmailTemplate } from '#app/common/utils/email/templates/password-reset.template';
import { CONFIG } from '#app/config';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import type { IAuthService } from './auth.service';
import { authService } from './auth.service';
import type { ForgotPasswordDto } from './dtos/forgot-password.dto';
import type { LoginUserDto } from './dtos/login-user.dto';
import type { ResetPasswordDto } from './dtos/reset-password.dto';

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
	async registerV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const createUserDto = req.body as CreateUserDto;
			const { newUser, accessToken, refreshToken } =
				await service.registerV1(createUserDto);
			const userObject = newUser.toObject();

			res.cookie('refresh_token', refreshToken, {
				httpOnly: true,
				secure: !CONFIG.DEBUG,
				sameSite: 'strict',
				maxAge: 23 * 60 * 60 * 1000, // slightly lower to prevent race condition
				path: '/auth/refresh',
			});

			req.user = newUser;

			res.sendSuccess(
				httpStatus.CREATED,
				{
					accessToken,
					user: { _id: userObject._id, email: userObject.email },
				},
				'user registered successfully',
			);
			return;
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
	async refreshTokensV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const refreshToken = req.cookies.refresh_token;
			if (!refreshToken) {
				res.sendError(httpStatus.UNAUTHORIZED, {
					code: 'UNAUTHORIZED',
					message: 'refresh token not found',
				});
				return;
			}

			const {
				refreshToken: newRefreshToken,
				accessToken: newAccessToken,
			} = await service.refreshTokensV1(refreshToken);

			res.cookie('refresh_token', newRefreshToken, {
				httpOnly: true,
				secure: !CONFIG.DEBUG,
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
			return;
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
	async logoutV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			await service.invalidateAllTokens(req.user?._id as Types.ObjectId);
			req.user = undefined;
			res.clearCookie('refresh_token', { path: '/auth/refreshs' });
			res.sendSuccess(
				httpStatus.OK,
				{},
				'You have been logged out. please invalidate the access token !',
			);
			return;
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Handles user login by validating credentials and issuing authentication tokens.
	 *
	 * @function loginV1
	 * @memberof AuthController
	 * @async
	 * @param {Request} req - Express request object containing the user credentials in the body.
	 * @param {Response} res - Express response object used to send back the tokens and user info.
	 * @param {NextFunction} next - Express next middleware function for error handling.
	 *
	 * @description
	 *  - Validates user credentials using the service layer.
	 *  - Issues an access token and a refresh token.
	 *  - Sets the refresh token in an HTTP-only cookie scoped to `/auth/refresh`.
	 *  - Attaches the user object to `req.user` for downstream middleware use.
	 *  - Responds with a success message, user ID, email, and the access token.
	 *
	 * @returns {void}
	 */
	async loginV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const loginUserDto = req.body as LoginUserDto;
			const { user, accessToken, refreshToken } =
				await service.loginV1(loginUserDto);
			const userObject = user.toObject();

			res.cookie('refresh_token', refreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				secure: !CONFIG.DEBUG,
				maxAge: 23 * 60 * 60 * 1000, // slightly lower to prevent race condition
				path: '/auth/refresh',
			});

			req.user = user;

			res.sendSuccess(
				httpStatus.CREATED,
				{
					accessToken,
					user: { _id: userObject._id, email: userObject.email },
				},
				'Login successful.',
			);
			return;
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Initiates the password reset process by generating a secure reset token and emailing the user.
	 *
	 * @function requestPasswordResetV1
	 * @memberof AuthController
	 * @async
	 * @param {Request} req - Express request object containing the user's email in the body.
	 * @param {Response} res - Express response object used to confirm reset email dispatch.
	 * @param {NextFunction} next - Express next middleware function for error handling.
	 *
	 * @description
	 *  - Extracts the email from the request body.
	 *  - Calls the service layer to generate a secure reset token for the user.
	 *  - Constructs a password reset URL using the token and configured client URL.
	 *  - Sends a password reset email using a templated HTML message.
	 *  - Responds with a success message confirming that the reset link was sent.
	 *
	 * @returns {void}
	 */
	async requestPasswordResetV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { email } = req.body as ForgotPasswordDto;
			const secureToken = await service.requestPasswordResetV1(email);

			const resetPasswordUrl = `${CONFIG.CLIENT_BASE_URL}${CONFIG.ROUTE.RESET_PASSWORD}?token=${secureToken.hash}`;

			await sendMail({
				from: 'AI Note App 🧠💡',
				to: email,
				subject: 'Reset Your Password',
				html: mailGenerator.generate(
					generatePasswordResetEmailTemplate(resetPasswordUrl),
				),
			});

			res.sendSuccess(
				httpStatus.OK,
				{},
				'a password reset link has been sent.',
			);
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Handles the password reset request from the client.
	 *
	 * This controller method:
	 * 1. Extracts the reset token and new password from the request body.
	 * 2. Attempts to reset the password via the service layer.
	 * 3. Responds with an error if the token is invalid.
	 * 4. Redirects the user to the login page upon success.
	 *
	 * @param {Request} req - The Express request object, expected to contain `token` and `password` in the body.
	 * @param {Response} res - The Express response object.
	 * @param {NextFunction} next - The Express next middleware function, used for error handling.
	 * @returns {Promise<void>} A promise that resolves when the response has been sent.
	 */
	async resetPasswordV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { token, password } = req.body as ResetPasswordDto;
			const { matchedCount } = await service.resetPasswordV1(
				token,
				password,
			);

			if (!matchedCount) {
				res.sendError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'invalid token',
				});
				return;
			}

			res.redirect(
				`${CONFIG.CLIENT_BASE_URL}${CONFIG.ROUTE.LOGIN_PAGE_ROUTE}`,
			);
		} catch (error) {
			next(error);
		}
	},
});

export const authController = createAuthController(authService);
