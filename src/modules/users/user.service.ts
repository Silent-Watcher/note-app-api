import type { CreateUserDto } from '#app/modules/users/dtos/create-user.dto';
import {
	type IUserRepository,
	userRepository,
} from '#app/modules/users/user.repository';

import type { Types } from 'mongoose';
import type { UserDocument } from './user.model';

/**
 * Interface defining the user service methods.
 */
export interface IUserService {
	findById(id: Types.ObjectId): Promise<UserDocument>;
	findOneByEmail(email: string): Promise<UserDocument>;
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument>;
}

/**
 * Factory function to create a user service instance.
 *
 * The service layer interacts with the repository and provides
 * abstraction for user-related operations such as finding and creating users.
 *
 * @param {IUserRepository} repo - The repository instance to interact with the database.
 */
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

/**
 * Singleton instance of the user service.
 */
export const userService = createUserService(userRepository);
