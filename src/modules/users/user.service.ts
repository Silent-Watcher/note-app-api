import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import type { ProjectionType, Types, UpdateResult } from 'mongoose';
import type { ClientSession } from 'mongoose';
import type { ID } from '#app/config/db/mongo/types';
import type { UserDocument } from './user.model';

export interface IUserService {
	findById(id: ID): Promise<UserDocument | null>;
	findOneByEmail(
		email: string,
		projection?: ProjectionType<UserDocument>,
		lean?: boolean,
		session?: ClientSession,
	): Promise<UserDocument | null>;
	updatePassword(
		id: Types.ObjectId,
		newPassword: string,
	): Promise<UpdateResult>;
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument>;
}

const createUserService = (repo: IUserRepository) => ({
	findById(id: ID): Promise<UserDocument | null> {
		return repo.findOne({ _id: id }, { password: 0 });
	},
	async findOneByEmail(
		email: string,
		projection?: ProjectionType<UserDocument>,
		lean?: boolean,
		session?: ClientSession,
	): Promise<UserDocument | null> {
		return repo.findOne({ email }, projection, lean, session);
	},
	async create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument> {
		return repo.create(createUserDto);
	},
	updatePassword(
		id: Types.ObjectId,
		newPassword: string,
	): Promise<UpdateResult> {
		return repo.updateOne({ _id: id }, { password: newPassword });
	},
});

export const userService = createUserService(userRepository);
