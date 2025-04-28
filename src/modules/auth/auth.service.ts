import { hash } from 'bcrypt';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import type { Document } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { CONFIG } from '#app/config';
import { refreshTokenRepository } from './auth.repository';
import type { IRefreshTokenRepository } from './auth.repository';

export interface IAuthService {
	registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: Document;
		accessToken: string;
		refreshToken: string;
	}>;
}

const createAuthService = (
	userRepo: IUserRepository,
	refreshTokenRepo: IRefreshTokenRepository,
) => ({
	async registerV1(createUserDto: CreateUserDto): Promise<{
		newUser: Document;
		accessToken: string;
		refreshToken: string;
	}> {
		const { email, password } = createUserDto;

		const emailTaken = await userRepo.findOneByEmail(email);
		if (emailTaken) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: 'email is already in use',
			});
		}

		const hashedPassword = await hash(password, 10);

		const newUser = await userRepo.create({
			email,
			password: hashedPassword,
		});

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

		await refreshTokenRepo.create({
			hash: refreshToken,
			rootIssuedAt: dayjs().toDate(),
			user: newUser._id,
		});

		return { newUser, accessToken, refreshToken };
	},
});

export const authService = createAuthService(
	userRepository,
	refreshTokenRepository,
);
