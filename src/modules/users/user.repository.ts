import type { Document } from 'mongoose';
import type { CreateUserDto } from './dtos/create-user.dto';
import { userModel } from './user.model';

export interface IUserRepository {
	findOneByEmail(email: string): Promise<Document | null>;
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<Document>;
}

const createUserRepository = () => ({
	async findOneByEmail(email: string): Promise<Document | null> {
		const foundedUser = (await userModel.findOne({
			email,
		})) as Document | null;
		return foundedUser;
	},

	async create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<Document> {
		const newUser = await userModel.create({
			email: createUserDto.email,
			password: createUserDto.password,
		});
		return newUser;
	},
});

export const userRepository = createUserRepository();
