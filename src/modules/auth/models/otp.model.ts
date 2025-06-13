import dayjs from 'dayjs';
import { Schema, Types, model } from 'mongoose';
import type { HydratedDocument, PaginateModel } from 'mongoose';
import mongoosePagiante from 'mongoose-paginate-v2';
import type { ID } from '#app/config/db/mongo/types';

export type Otp = {
	user: ID;
	code: string;
	type: 'email_verification';
	expiresAt: Date;
	used: boolean;
};

const otpSchema = new Schema(
	{
		user: {
			type: Types.ObjectId,
			ref: 'users',
			required: true,
		},
		code: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 5,
			match: /^[A-Za-z0-9]{5}$/, // only alphanumeric
		},
		type: {
			type: String,
			enum: ['email_verification'],
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
			dafault: dayjs().add(5, 'minutes').toDate(),
		},
		used: { type: Boolean, default: false },
	},
	{ timestamps: true, versionKey: false },
);

otpSchema.plugin(mongoosePagiante);

// compound index to prevent duplicate active OTPs
otpSchema.index(
	{ userId: 1, type: 1, used: 1 },
	{ unique: true, partialFilterExpression: { used: false } },
);

export type OtpDocument = HydratedDocument<Otp>;
export const otpModel = model<Otp, PaginateModel<Otp>>('otp', otpSchema);
