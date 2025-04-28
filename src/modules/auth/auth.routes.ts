import { Router } from 'express';
import { validateBody } from '#app/common/middlewares/dataValidation';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { zCreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { authController } from './auth.controller';

const authRouterV1 = Router();

// Register Route
/**
 * @route POST /register
 * @summary Registers a new user.
 * @description
 * - Validates the request body against `zCreateUserDto`.
 * - Calls the `registerV1` controller to create a new user and issue authentication tokens.
 * @access Public
 */
authRouterV1.post(
	'/register',
	validateBody(zCreateUserDto),
	authController.registerV1,
);

// Refresh Tokens Route
/**
 * @route POST /refresh
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
 * @middleware verifyUser - Middleware to verify the authenticated user.
 * @controller authController.logoutV1 - Handles the logout logic.
 */
authRouterV1.get('/logout', verifyUser, authController.logoutV1);

export { authRouterV1 };
