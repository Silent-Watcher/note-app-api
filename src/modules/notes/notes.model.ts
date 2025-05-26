import { Schema, Types, model } from 'mongoose';
import type { HydratedDocument, InferSchemaType } from 'mongoose';

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

export type Note = InferSchemaType<typeof noteSchema>;
export type NoteDocument = HydratedDocument<Note>;
export const noteModel = model('note', noteSchema);
