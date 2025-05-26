import { Schema, model } from 'mongoose';
import type { HydratedDocument, InferSchemaType } from 'mongoose';

const userSchema = new Schema(
	{
		email: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true, trim: true },
		isEmailVerified: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false },
);

/**
 * Type representing the plain User schema structure
 * (without any Mongoose document methods or fields like `_id`).
 */
export type User = InferSchemaType<typeof userSchema>;

/**
 * Type representing a full Mongoose User document,
 * including Mongoose-specific fields and methods (like `_id`, `save()`, etc).
 */
export type UserDocument = HydratedDocument<User>;

export const userModel = model<UserDocument>('user', userSchema);
