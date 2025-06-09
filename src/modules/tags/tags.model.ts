import { Schema, Types, model } from 'mongoose';
import type {
	HydratedDocument,
	InferSchemaType,
	PaginateModel,
} from 'mongoose';

import mongoosePagiante from 'mongoose-paginate-v2';

const tagSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		color: {
			type: String,
			required: true,
			trim: true,
		},
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
		pinned: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true, versionKey: false },
);

tagSchema.plugin(mongoosePagiante);
tagSchema.index({ name: 'text' });

export type Tag = InferSchemaType<typeof tagSchema>;
export type TagDocument = HydratedDocument<Tag>;
export const tagModel = model('tag', tagSchema) as PaginateModel<Tag>;
