import dayjs from 'dayjs';
import type { HydratedDocument, InferSchemaType } from 'mongoose';
import { Schema, model } from 'mongoose';

/**
 * Mongoose schema for the Refresh Token collection.
 *
 * Fields:
 * - `user` (ObjectId): Reference to the user that the token belongs to (required).
 * - `hash` (string): The hashed refresh token (required, trimmed).
 * - `issuedAt` (Date): The date and time when the refresh token was issued (defaults to the current time).
 * - `expiresAt` (Date): The expiration date and time of the refresh token (defaults to 1 day from the issuance).
 * - `revokedAt` (Date): The date and time when the refresh token was revoked (optional).
 * - `rootIssuedAt` (Date): The root issue date for tracking the lifetime of the session.
 * - `status` (string): The status of the refresh token, either 'valid' or 'invalid' (defaults to 'valid').
 */
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

/**
 * Type representing the plain RefreshToken schema structure
 * (without any Mongoose document methods or fields like `_id`).
 */
export type RefreshToken = InferSchemaType<typeof refreshTokenSchema>;

/**
 * Type representing a full Mongoose RefreshToken document,
 * including Mongoose-specific fields and methods (like `_id`, `save()`, etc).
 */
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

/**
 * Mongoose model for the Refresh Token schema.
 */
export const refreshTokenModel = model<RefreshTokenDocument>(
	'refresh_token',
	refreshTokenSchema,
);
