import { Schema, Types, model } from 'mongoose';
import type { HydratedDocument, PaginateModel } from 'mongoose';
import type { ID } from '#app/config/db/mongo/types';

import mongoosePagiante from 'mongoose-paginate-v2';

export type Note = {
	user: ID;
	tags: ID[];
	title: string;
	body: string;
	pinned: boolean;
	locked: boolean;
};

const noteSchema = new Schema(
	{
		user: {
			type: Types.ObjectId,
			ref: 'user',
			required: true,
			default: undefined,
		},
		tags: {
			type: [Types.ObjectId],
			ref: 'tag',
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
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

noteSchema.index({ title: 'text', body: 'text' });
noteSchema.plugin(mongoosePagiante);

export type NoteDocument = HydratedDocument<Note>;
export const noteModel = model<Note, PaginateModel<Note>>('note', noteSchema);
