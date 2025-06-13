import { Schema, Types, model } from 'mongoose';
import type { HydratedDocument, PaginateModel } from 'mongoose';
import type { ID } from '#app/config/db/mongo/types';

import mongoosePagiante from 'mongoose-paginate-v2';

export type Tag = {
	name: string;
	color: string;
	parent?: ID;
	user?: ID;
	pinned: boolean;
};

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

export type TagDocument = HydratedDocument<Tag>;
export const tagModel = model<Tag, PaginateModel<Tag>>('tag', tagSchema);
