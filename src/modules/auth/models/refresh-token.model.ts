import dayjs from 'dayjs';
import type { HydratedDocument, Model } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { ID } from '#app/config/db/mongo/types';

export type RefreshToken = {
	user: ID;
	hash: string;
	issuedAt: Date;
	expiresAt: Date;
	revokedAt?: Date;
	rootIssuedAt: Date;
	status: 'valid' | 'invalid';
};

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

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export const refreshTokenModel = model<RefreshToken, Model<RefreshToken>>(
	'refresh_token',
	refreshTokenSchema,
);
