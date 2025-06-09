import { Router } from 'express';
import { blockIfAuthenticated } from '#app/common/middlewares/blockIfAuthenticated';
import { verifyCaptcha } from '#app/common/middlewares/verifyCaptcha';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { validateBody } from '#app/common/validation/dataValidation';
import { zCreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import { authController } from './auth.controller';
import { zForgotPasswordDto } from './dtos/forgot-password.dto';
import { zLoginUserDto } from './dtos/login-user.dto';
import { zResetPasswordDto } from './dtos/reset-password.dto';
import { zVerifyEmailDto } from './dtos/verify-email.dto';

const authRouterV1 = Router();

authRouterV1.post(
	'/register',
	blockIfAuthenticated,
	// verifyCaptcha('register'),
	validateBody(zCreateUserDto),
	authController.registerV1,
);

authRouterV1.post('/refresh', authController.refreshTokensV1);

authRouterV1.get('/logout', verifyUser, authController.logoutV1);

authRouterV1.post(
	'/login',
	blockIfAuthenticated,
	// verifyCaptcha('login'),
	validateBody(zLoginUserDto),
	authController.loginV1,
);

authRouterV1.post(
	'/forgot-password',
	blockIfAuthenticated,
	// verifyCaptcha('forgotPass'),
	validateBody(zForgotPasswordDto),
	authController.requestPasswordResetV1,
);

authRouterV1.post(
	'/reset-password',
	blockIfAuthenticated,
	validateBody(zResetPasswordDto),
	authController.resetPasswordV1,
);

authRouterV1.post(
	'/verify-email',
	validateBody(zVerifyEmailDto),
	authController.verifyEmail,
);

export { authRouterV1 };
