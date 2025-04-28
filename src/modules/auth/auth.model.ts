import dayjs from 'dayjs';
import type { HydratedDocument, InferSchemaType } from 'mongoose';
import { Schema, model } from 'mongoose';

// Refresh Token Schema with rootIssuedAt for absolute expiry
const refreshTokenSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
		hash: { type: String, required: true, trim: true },
		issuedAt: { type: Date, required: true, default: dayjs() },
		expiresAt: {
			type: Date,
			required: true,
			default: dayjs().add(1, 'day'),
		},
		revokedAt: { type: Date, required: false, default: undefined },
		rootIssuedAt: { type: Date, required: true },
		status: { type: String, enum: ['valid', 'invalid'], default: 'valid' },
	},
	{ timestamps: false, versionKey: false },
);

export type RefreshToken = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export const refreshTokenModel = model<RefreshTokenDocument>(
	'refresh_token',
	refreshTokenSchema,
);
