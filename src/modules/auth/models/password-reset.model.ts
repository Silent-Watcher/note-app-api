import dayjs from 'dayjs';
import type { HydratedDocument, InferSchemaType } from 'mongoose';
import { Schema, Types, model } from 'mongoose';

const passwordResetSchema = new Schema(
	{
		user: { type: Types.ObjectId, required: true, ref: 'users' },
		tokenHash: { type: String, required: true, trim: true },
		expiresAt: {
			type: Date,
			required: true,
			default: dayjs().add(1, 'hour'),
		},
		used: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false },
);

export type PasswordReset = InferSchemaType<typeof passwordResetSchema>;
export type PasswordResetDocument = HydratedDocument<PasswordReset>;

export const passwordResetModel = model<PasswordResetDocument>(
	'password_reset',
	passwordResetSchema,
);
