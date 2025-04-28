import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import type { Types } from 'mongoose';
import type { UserDocument } from './user.model';

export interface IUserService {
	findById(id: Types.ObjectId): Promise<UserDocument>;
	findOneByEmail(email: string): Promise<UserDocument>;
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument>;
}

const createUserService = (repo: IUserRepository) => ({
	findById(id: Types.ObjectId): Promise<UserDocument> {
		return repo.findById(id);
	},
	findOneByEmail(email: string): Promise<UserDocument> {
		return repo.findOneByEmail(email);
	},
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument> {
		return repo.create(createUserDto);
	},
});

export const userService = createUserService(userRepository);
