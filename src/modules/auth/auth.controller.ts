import type { Job } from 'bullmq';
import type { NextFunction, Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { DecodedToken } from '#app/common/helpers/jwt';
import type { CommandResult } from '#app/config/db/global';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import type { UserDocument } from '../users/user.model';
import type { IUserService } from '../users/user.service';
import type { IAuthService } from './auth.service';
import type { ForgotPasswordDto } from './dtos/forgot-password.dto';
import type { LoginUserDto } from './dtos/login-user.dto';
import type { ResetPasswordDto } from './dtos/reset-password.dto';
import type { VerifyEmailDto } from './dtos/verify-email.dto';

import { hash } from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import {
	getGithubProfileAndEmails,
	getGithubTokenFromCode,
	issueGithubState,
	validateGithubState,
} from '#app/common/helpers/githubAuth';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { issueToken, sendRefreshTokenCookie } from '#app/common/helpers/jwt';
import { mailGenerator } from '#app/common/helpers/mailgen';
import { isIpBlocked } from '#app/common/helpers/redis';
import { generatePasswordResetEmailTemplate } from '#app/common/utils/email/templates/password-reset.template';
import { generateVerifyEmailTemplate } from '#app/common/utils/email/templates/verify-email.template';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '#app/config';
import { unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo/mongo.condig';
import { enqueueEmail } from '#app/queues/emailQueue';
import { userModel } from '../users/user.model';
import { userService } from '../users/user.service';
import { authService } from './auth.service';
import { refreshTokenModel } from './models/refresh-token.model';

const createAuthController = (
	service: IAuthService,
	userService: IUserService,
) => ({
	async registerV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const createUserDto = req.body as CreateUserDto;
			const newUser = await service.registerV1(createUserDto);
			const userObject = newUser.toObject();

			const newOtp = await service.createOtp(
				'email_verification',
				userObject._id,
			);

			let job: Awaited<Promise<Job>> | null = null;
			if (CONFIG.DEBUG) {
				logger.info(`Email verification OTP: ${newOtp.code}`);
			} else {
				job = await enqueueEmail({
					from: 'AI Note App 🧠💡 <no-reply>',
					to: userObject.email,
					subject: 'Verify your email',
					html: mailGenerator.generate(
						generateVerifyEmailTemplate(newOtp.code as string),
					),
				});
			}

			res.sendSuccess(
				httpStatus.ACCEPTED,
				{
					// accessToken,
					user: { _id: userObject._id, email: userObject.email },
				},
				'user registered successfully',
				{
					'action:next': 'verify user email',
					...(!CONFIG.DEBUG
						? {
								email: {
									enqueued: true,
									jobId: job?.id,
								},
							}
						: {}),
				},
			);
			return;
		} catch (error) {
			next(error);
		}
	},

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

			sendRefreshTokenCookie(newRefreshToken, res);

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

	async logoutV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			await service.invalidateAllTokens(req.user?._id as Types.ObjectId);
			req.user = undefined;
			res.clearCookie('refresh_token', { path: '/api/auth/refreshs' });
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

	async loginV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			if (await isIpBlocked(req.ip as string, 'login:block:ip')) {
				logger.error(
					`[login][fraud] request from blocked IP ${req.ip}`,
				);
				res.sendError(httpStatus.FORBIDDEN, {
					code: 'FORBIDDEN',
					message: 'you have been blocked for 24 hours',
				});
				return;
			}

			const loginUserDto = req.body as LoginUserDto;
			const { user, accessToken, refreshToken } = await service.loginV1(
				loginUserDto,
				req.ip as string,
			);
			const userObject = user.toObject();

			sendRefreshTokenCookie(refreshToken, res);

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

	async requestPasswordResetV1(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { email } = req.body as ForgotPasswordDto;
			const secureToken = await service.requestPasswordResetV1(email);

			const resetPasswordUrl = `${CONFIG.CLIENT_BASE_URL}${CONFIG.ROUTE.RESET_PASSWORD}?token=${secureToken.hash}`;

			const job = await enqueueEmail({
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
				{
					email: {
						enqueued: true,
						jobId: job.id,
					},
				},
			);
		} catch (error) {
			next(error);
		}
	},

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

	async verifyEmail(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, code } = req.body as VerifyEmailDto;
			const { user, accessToken, refreshToken } =
				await service.verifyEmail(email, code);

			sendRefreshTokenCookie(refreshToken, res);

			req.user = user;

			res.sendSuccess(
				httpStatus.CREATED,
				{
					accessToken,
					user: { _id: user._id, email: user.email },
				},
				'registeration process completed: email verified',
			);
		} catch (error) {
			next(error);
		}
	},

	async redirectToGithubPage(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const githubState = issueGithubState();
			const params = new URLSearchParams({
				client_id: CONFIG.GITHUB.CLIENT_ID,
				redirect_uri: CONFIG.GITHUB.CALLBACK_URL,
				state: githubState,
				scope: 'read:user user:email',
			});
			res.redirect(`https://github.com/login/oauth/authorize?${params}`);
			return;
		} catch (error) {
			next(error);
		}
	},

	async handleGithubReturnCode(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { code, state } = req.query;

			if (!state || !code) {
				res.sendError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'Bad Credentials',
				});
				return;
			}
			// verify state
			validateGithubState(state as string);

			const githubAccessToken = await getGithubTokenFromCode(
				code as string,
			);

			const ghProfile =
				await getGithubProfileAndEmails(githubAccessToken);

			const targetUser = await unwrap(
				(await mongo.fire(() =>
					userModel.findOne({ email: ghProfile.email }),
				)) as CommandResult<Promise<UserDocument | null>>,
			);

			if (!targetUser) {
				const newUser = await userService.create({
					avatar: [
						{
							source: 'Github',
							urls: [ghProfile.avatarUrl as string],
						},
					],
					email: ghProfile.email,
					githubId: ghProfile.id,
					displayName: ghProfile.email?.split('@')[0],
					isEmailVerified: true,
				});

				const tempToken = issueToken(
					{
						userId: newUser._id,
						githubId: newUser.githubId,
						githubOnly: true,
					},
					CONFIG.JWT_ACCESS_SECRET,
					{ expiresIn: '5m' },
				);

				res.sendSuccess(
					httpStatus.ACCEPTED,
					{
						user: newUser.toObject(),
						needsPassword: true,
						tempToken,
					},
					'user should specify their password',
				);
				return;
			}

			if (!targetUser.githubId) {
				await targetUser.updateOne({ githubId: ghProfile.id });
			}

			if (!targetUser?.password) {
				const tempToken = issueToken(
					{
						userId: targetUser._id,
						githubId: targetUser.githubId,
						githubOnly: true,
					},
					CONFIG.JWT_ACCESS_SECRET,
					{ expiresIn: '5m' },
				);

				res.sendSuccess(
					httpStatus.ACCEPTED,
					{
						user: targetUser.toObject(),
						needsPassword: true,
						tempToken,
					},
					'user should specify their password',
				);
				return;
			}

			const accessToken = issueToken(
				{ userId: targetUser._id },
				CONFIG.SECRET.ACCESS_TOKEN,
				{ expiresIn: '5m' },
			);

			const refreshToken = issueToken(
				{ userId: targetUser._id },
				CONFIG.SECRET.REFRESH_TOKEN,
				{ expiresIn: '1d' },
			);

			await unwrap(
				await mongo.fire(() =>
					refreshTokenModel.create({
						hash: refreshToken,
						rootIssuedAt: dayjs().toDate(),
						user: targetUser._id,
					}),
				),
			);

			sendRefreshTokenCookie(refreshToken, res);

			req.user = targetUser;

			res.sendSuccess(
				httpStatus.OK,
				{
					user: { _id: targetUser._id, email: targetUser.email },
					accessToken,
				},
				'login success!',
			);
			return;
		} catch (error) {
			next(error);
		}
	},

	async setPassword(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { password } = req.body;

			const authHeader = req.headers.authorization;
			if (!authHeader) {
				res.sendError(httpStatus.FORBIDDEN, {
					code: 'FORBIDDEN',
					message: 'authorization header not found',
				});
				return;
			}
			const tempToken = authHeader?.split(' ')[1];

			if (!tempToken) {
				res.sendError(httpStatus.FORBIDDEN, {
					code: 'FORBIDDEN',
					message: 'token not found!',
				});
				return;
			}

			jwt.verify(
				tempToken,
				CONFIG.JWT_ACCESS_SECRET,
				async (
					err: jwt.VerifyErrors | null,
					decoded: string | jwt.JwtPayload | undefined,
				) => {
					const { userId, githubId } = decoded as DecodedToken;

					if (err instanceof jwt.TokenExpiredError) {
						await unwrap(
							await mongo.fire(() =>
								userModel.deleteOne({
									_id: userId,
									githubId: githubId,
								}),
							),
						);
						res.sendError(httpStatus.BAD_REQUEST, {
							code: 'BAD REQUEST',
							message: 'token expired',
						});
						return;
					}

					if (err instanceof jwt.JsonWebTokenError) {
						res.sendError(httpStatus.BAD_REQUEST, {
							code: 'BAD REQUEST',
							message: 'invalid token',
						});
						return;
					}

					const newPassword = await hash(password, 10);

					const updatedUser = await unwrap(
						(await mongo.fire(() =>
							userModel.findOneAndUpdate(
								{
									_id: userId,
									githubId,
								},
								{ $set: { password: newPassword } },
								{ returnDocument: 'after' },
							),
						)) as CommandResult<UserDocument | null>,
					);

					if (!updatedUser) {
						res.sendError(httpStatus.BAD_REQUEST, {
							code: 'BAD REQUEST',
							message: 'user not found',
						});
						return;
					}

					const accessToken = issueToken(
						{ userId },
						CONFIG.SECRET.ACCESS_TOKEN,
						{ expiresIn: '5m' },
					);

					const refreshToken = issueToken(
						{ userId },
						CONFIG.SECRET.REFRESH_TOKEN,
						{ expiresIn: '1d' },
					);

					await unwrap(
						await mongo.fire(() =>
							refreshTokenModel.create({
								hash: refreshToken,
								rootIssuedAt: dayjs().toDate(),
								user: userId,
							}),
						),
					);

					sendRefreshTokenCookie(refreshToken, res);

					req.user = updatedUser;

					res.sendSuccess(httpStatus.OK, {
						accessToken,
						user: {
							_id: updatedUser._id,
							email: updatedUser.email,
						},
					});
				},
			);
		} catch (error) {
			next(error);
		}
	},
});

export const authController = createAuthController(authService, userService);
