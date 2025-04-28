import { hash } from 'bcrypt';
import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import type { Document } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import type { IAuthRepository } from './auth.repository';
import { authRepository } from './auth.repository';

export interface IAuthService {
	registerV1(createUserDto: CreateUserDto): Promise<Document>;
}

const createAuthService = (
	repo: IAuthRepository,
	userRepo: IUserRepository,
) => ({
	async registerV1(createUserDto: CreateUserDto) {
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
		return newUser;
	},
});

export const authService = createAuthService(authRepository, userRepository);
