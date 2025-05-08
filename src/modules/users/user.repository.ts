import type { Types, UpdateResult } from 'mongoose';
import { mongo } from '#app/config/db/mongo.condig';
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
	findOneByEmail(email: string): Promise<UserDocument | null> {
		return mongo.fire(() =>
			userModel.findOne({ email }),
		) as Promise<UserDocument | null>;
	},

	findById(id: Types.ObjectId): Promise<UserDocument | null> {
		return mongo.fire(() =>
			userModel.findById(id),
		) as Promise<UserDocument | null>;
	},

	create(
		createUserDto: Omit<CreateUserDto, 'confirmPassword'>,
	): Promise<UserDocument> {
		return mongo.fire(() =>
			userModel.create({
				email: createUserDto.email,
				password: createUserDto.password,
			}),
		) as Promise<UserDocument>;
	},

	updatePassword(
		id: Types.ObjectId,
		newPassword: string,
	): Promise<UpdateResult> {
		return mongo.fire(() =>
			userModel.updateOne(
				{ _id: id },
				{
					$set: { password: newPassword },
				},
			),
		) as Promise<UpdateResult>;
	},
});

/**
 * Singleton instance of the user repository.
 */
export const userRepository = createUserRepository();
