import { Schema, Types, model } from 'mongoose';
import type {
	HydratedDocument,
	InferSchemaType,
	PaginateModel,
} from 'mongoose';

import mongoosePagiante from 'mongoose-paginate-v2';

const noteSchema = new Schema(
	{
		user: {
			type: Types.ObjectId,
			ref: 'users',
			required: true,
			default: undefined,
		},
		tags: {
			type: [Types.ObjectId],
			ref: 'tags',
			required: true,
			default: [],
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		body: {
			type: String,
			required: true,
			trim: true,
		},
		pinned: {
			type: Boolean,
			required: true,
			default: false,
		},
		locked: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true, versionKey: false },
);

noteSchema.plugin(mongoosePagiante);

export type Note = InferSchemaType<typeof noteSchema>;
export type NoteDocument = HydratedDocument<Note>;
export const noteModel = model('note', noteSchema) as PaginateModel<Note>;
