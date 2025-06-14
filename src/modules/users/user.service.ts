import type {
	DeleteResult,
	FilterQuery,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
	UpdateResult,
} from 'mongoose';
import type { ClientSession } from 'mongoose';
import type { ID } from '#app/config/db/mongo/types';
import { userRepository } from '#app/modules/users/user.repository';
import type { IUserRepository } from '#app/modules/users/user.repository';
import type { User, UserDocument } from './user.model';

export interface IUserService {
	findById(id: ID): Promise<UserDocument | null>;

	findOneAndUpdate(
		filter: FilterQuery<UserDocument>,
		changes: UpdateQuery<UserDocument>,
		options: QueryOptions,
	): Promise<UserDocument | null>;

	findOneByEmail(
		email: string,
		projection?: ProjectionType<UserDocument>,
		lean?: boolean,
		session?: ClientSession,
	): Promise<UserDocument | null>;

	updatePassword(id: ID, newPassword: string): Promise<UpdateResult>;

	create(dto: Partial<User>): Promise<UserDocument>;

	updateOne(
		filter: FilterQuery<UserDocument>,
		changes: UpdateQuery<UserDocument>,
		session?: ClientSession,
	): Promise<UpdateResult>;

	deleteOne(
		filter: FilterQuery<UserDocument>,
		session?: ClientSession,
	): Promise<DeleteResult>;
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
	updatePassword(id: ID, newPassword: string): Promise<UpdateResult> {
		return repo.updateOne({ _id: id }, { password: newPassword });
	},

	updateOne(
		filter: FilterQuery<UserDocument>,
		changes: UpdateQuery<UserDocument>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return repo.updateOne(filter, changes, session);
	},

	async findOneAndUpdate(
		filter: FilterQuery<UserDocument>,
		changes: UpdateQuery<UserDocument>,
		options: QueryOptions,
	): Promise<UserDocument | null> {
		return repo.findOneAndUpdate(filter, changes, options);
	},

	deleteOne(
		filter: FilterQuery<UserDocument>,
		session?: ClientSession,
	): Promise<DeleteResult> {
		return repo.deleteOne(filter, session);
	},
});

export const userService = createUserService(userRepository);
