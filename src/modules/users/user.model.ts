import { Schema, model } from 'mongoose';

const userSchema = new Schema(
	{
		email: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true, trim: true },
		isEmailVerified: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false },
);

export const userModel = model('user', userSchema);
