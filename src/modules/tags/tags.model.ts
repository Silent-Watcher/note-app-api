import { Schema, Types, model } from 'mongoose';
import type { HydratedDocument, InferSchemaType } from 'mongoose';

const tagSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		color: { type: String, required: true, trim: true },
		parent: {
			type: Types.ObjectId,
			ref: 'tags',
			required: false,
			default: undefined,
		},
		user: {
			type: Types.ObjectId,
			ref: 'users',
			required: true,
			default: undefined,
		},
		pinned: { type: Boolean, required: true, default: false },
	},
	{ timestamps: false, versionKey: false },
);

export type Tag = InferSchemaType<typeof tagSchema>;
export type TagDocument = HydratedDocument<Tag>;
export const tagModel = model('tag', tagSchema);
