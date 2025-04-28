import type { Types } from 'mongoose';
import type { CreateUserDto } from './dtos/create-user.dto';
import { userModel } from './user.model';
import type { UserDocument } from './user.model';

export interface IUserRepository {
	findOneByEmail(email: string): Promise<UserDocument>;
	findById(id: Types.ObjectId): Promise<UserDocument>;
	create(
		createUserDto: Pick<CreateUserDto, 'email' | 'password'>,
	): Promise<UserDocument>;
}

const createUserRepository = () => ({
	async findOneByEmail(email: string): Promise<UserDocument> {
		const foundedUser = (await userModel.findOne({
			email,
		})) as UserDocument;
		return foundedUser;
	},

	async findById(id: Types.ObjectId): Promise<UserDocument> {
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
});

export const userRepository = createUserRepository();
