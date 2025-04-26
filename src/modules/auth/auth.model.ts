import dayjs from 'dayjs';
import { Schema } from 'mongoose';

export const otpSchema = new Schema(
	{
		email: { type: String, required: true, trim: true },
		value: { type: String, required: true, trim: true },
		expiresAt: {
			type: Date,
			required: true,
			default: dayjs().add(2, 'minute'),
		},
	},
	{ timestamps: { updatedAt: false }, versionKey: false },
);
