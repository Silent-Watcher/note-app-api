import { createBaseRepository } from '#app/config/db/mongo/repository';
import type { User, UserDocument } from './user.model';
import { userModel } from './user.model';

export interface IUserRepository
	extends ReturnType<typeof createBaseRepository<User, UserDocument>> {}

const base = createBaseRepository<User, UserDocument>(userModel);
const createUserRepository = () => ({
	...base,
});

export const userRepository = createUserRepository();
