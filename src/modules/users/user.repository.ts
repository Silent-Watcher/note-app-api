import type { Types, UpdateResult } from 'mongoose';
import type { CreateUserDto } from './dtos/create-user.dto';
import { userModel } from './user.model';
import type { UserDocument } from './user.model';

/**
 * Interface defining the user repository methods for database operations.
 */
export interface IUserRepository {
	findOneByEmail(email: string): Promise<UserDocument | null>;
	findById(id: Types.ObjectId): Promise<UserDocument | null>;
	updatePassword(
		id: Types.ObjectId,
		newPassword: string,
	): Promise<UpdateResult>;
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument>;
}

/**
 * Factory function to create a user repository instance.
 *
 * Provides methods to interact with the user collection in the database,
 * such as finding users by email or ID and creating new users.
 */
const createUserRepository = () => ({
	async findOneByEmail(email: string): Promise<UserDocument | null> {
		const foundedUser = (await userModel.findOne({
			email,
		})) as UserDocument;
		return foundedUser;
	},

	async findById(id: Types.ObjectId): Promise<UserDocument | null> {
		const foundedUser = await userModel.findById(id);
		return foundedUser as UserDocument;
	},

	async create(
		createUserDto: Omit<CreateUserDto, 'confirmPassword'>,
	): Promise<UserDocument> {
		const newUser = await userModel.create({
			email: createUserDto.email,
			password: createUserDto.password,
		});
		return newUser;
	},
	async updatePassword(
		id: Types.ObjectId,
		newPassword: string,
	): Promise<UpdateResult> {
		const result = await userModel.updateOne(
			{ _id: id },
			{
				$set: { password: newPassword },
			},
		);
		return result;
	},
});

/**
 * Singleton instance of the user repository.
 */
export const userRepository = createUserRepository();
