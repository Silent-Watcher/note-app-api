import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import type {
	FilterQuery,
	ProjectionType,
	Types,
	UpdateQuery,
	UpdateResult,
} from 'mongoose';
import type { ClientSession } from 'mongoose';
import type { ID } from '#app/config/db/mongo/types';
import type { User, UserDocument } from './user.model';

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

	create(dto: Partial<User>): Promise<UserDocument>;

	updateOne(
		filter: FilterQuery<UserDocument>,
		changes: UpdateQuery<UserDocument>,
		session?: ClientSession,
	): Promise<UpdateResult>;
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
	async create(dto: Partial<User>): Promise<UserDocument> {
		return repo.create(dto);
	},
	updatePassword(
		id: Types.ObjectId,
		newPassword: string,
	): Promise<UpdateResult> {
		return repo.updateOne({ _id: id }, { password: newPassword });
	},

	updateOne(
		filter: FilterQuery<UserDocument>,
		changes: UpdateQuery<UserDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return repo.updateOne(filter, changes, session);
	},
});

export const userService = createUserService(userRepository);
