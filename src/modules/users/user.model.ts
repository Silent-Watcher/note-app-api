import {
	type HydratedDocument,
	type InferSchemaType,
	Schema,
	model,
} from 'mongoose';

const userSchema = new Schema(
	{
		email: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true, trim: true },
		isEmailVerified: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false },
);

export const userModel = model('user', userSchema);

// the “plain” schema type
export type User = InferSchemaType<typeof userSchema>;
// add Mongoose’s Document stuff (_id, save(), etc):
export type UserDocument = HydratedDocument<User>;
