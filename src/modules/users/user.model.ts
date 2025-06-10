import { Schema, model } from 'mongoose';
import type {
	HydratedDocument,
	InferSchemaType,
	PaginateModel,
} from 'mongoose';
import mongoosePagiante from 'mongoose-paginate-v2';

const avatarSchema = new Schema(
	{
		source: { type: String, required: true, trim: true },
		url: { type: String, required: true, trim: true },
	},
	{ timestamps: false, versionKey: false, id: false },
);

const userSchema = new Schema(
	{
		displayName: {
			type: String,
			required: false,
			trim: true,
			unique: false,
		},
		avatar: { type: [avatarSchema], required: false, default: [] },
		email: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true, trim: true },
		mobile: { type: String, required: false, default: undefined },
		isMobileVerfied: { type: Boolean, required: false, default: false },
		isEmailVerified: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false },
);

userSchema.plugin(mongoosePagiante);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export const userModel = model('user', userSchema) as PaginateModel<User>;
