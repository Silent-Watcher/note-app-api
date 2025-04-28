import { hash } from 'bcrypt';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import jwt from 'jsonwebtoken';
import type { Document } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { CONFIG } from '#app/config';
import type { IAuthRepository } from './auth.repository';
import { authRepository } from './auth.repository';

export interface IAuthService {
	registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: Document;
		accessToken: string;
		refreshToken: string;
	}>;
}

const createAuthService = (
	repo: IAuthRepository,
	userRepo: IUserRepository,
) => ({
	async registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: Document;
		accessToken: string;
		refreshToken: string;
	}> {
		const { email, password } = createUserDto;
		// check if the email is already in use
		const emailTaken = await userRepo.findOneByEmail(email);
		if (emailTaken) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'email is already in use',
			});
		}
		// encrypt the user password
		const hashedPassword = await hash(password, 10);
		// use repo in order to save the user
		const newUser = await userRepo.create({
			email,
			password: hashedPassword,
		});

		// issue the access token and the refresh token
		const accessToken = jwt.sign(
			{ userId: newUser._id },
			CONFIG.SECRET.ACCESS_TOKEN,
			{ expiresIn: '5m' },
		);

		const refreshToken = jwt.sign(
			{ userId: newUser._id },
			CONFIG.SECRET.REFRESH_TOKEN,
			{ expiresIn: '1d' },
		);

		return { newUser, accessToken, refreshToken };
	},
});

export const authService = createAuthService(authRepository, userRepository);
