import { Router } from 'express';
import { blockIfAuthenticated } from '#app/common/middlewares/blockIfAuthenticated';
import { validateBody } from '#app/common/middlewares/dataValidation';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { zCreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { authController } from './auth.controller';
import { zForgotPasswordDto } from './dtos/forgot-password.dto';
import { zLoginUserDto } from './dtos/login-user.dto';

const authRouterV1 = Router();

// Register Route
/**
 * @route POST /register
 * @group Authentication - Endpoints for user authentication
 * @summary Registers a new user.
 * @description
 * - Blocks the request if the user is already authenticated (`blockIfAuthenticated` middleware).
 * - Validates the request body against `zCreateUserDto`.
 * - Calls the `registerV1` controller to create a new user and issue authentication tokens.
 * @access Public
 */
authRouterV1.post(
	'/register',
	blockIfAuthenticated,
	validateBody(zCreateUserDto),
	authController.registerV1,
);

// Refresh Tokens Route
/**
 * @route POST /refresh
 * @group Authentication - Endpoints for user authentication
 * @summary Refreshes access and refresh tokens.
 * @description
 * - Expects a valid `refresh_token` cookie from the client.
 * - Calls the `refreshTokensV1` controller to issue new tokens.
 * @access Public
 */
authRouterV1.post('/refresh', authController.refreshTokensV1);

// Logout Route
/**
 * Logs out the authenticated user by invalidating their refresh tokens.
 *
 * @route GET /logout
 * @group Authentication - Endpoints for user authentication
 * @middleware verifyUser - Middleware to verify the authenticated user.
 * @controller authController.logoutV1 - Handles the logout logic.
 * @access Public
 */
authRouterV1.get('/logout', verifyUser, authController.logoutV1);

//login Route
/**
 * @route POST /login
 * @group Authentication - Endpoints for user authentication
 * @summary Logs in a user and returns authentication tokens
 * @description
 * - Blocks the request if the user is already authenticated (`blockIfAuthenticated` middleware).
 * - Validates the request body against `zLoginUserDto`.
 * - Calls the `loginV1` controller to login the user and issue authentication tokens.
 * @access Public
 */
authRouterV1.post(
	'/login',
	blockIfAuthenticated,
	validateBody(zLoginUserDto),
	authController.loginV1,
);

authRouterV1.post(
	'/forgot-password',
	blockIfAuthenticated,
	validateBody(zForgotPasswordDto),
	authController.requestPasswordResetV1,
);

export { authRouterV1 };
