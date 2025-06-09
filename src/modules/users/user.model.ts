import { Schema, model } from 'mongoose';
import type {
	HydratedDocument,
	InferSchemaType,
	PaginateModel,
} from 'mongoose';
import mongoosePagiante from 'mongoose-paginate-v2';

const userSchema = new Schema(
	{
		email: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true, trim: true },
		isEmailVerified: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false },
);

userSchema.plugin(mongoosePagiante);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export const userModel = model('user', userSchema) as PaginateModel<User>;
