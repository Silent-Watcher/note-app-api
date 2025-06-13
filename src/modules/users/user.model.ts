import { Schema, model } from 'mongoose';
import type { HydratedDocument, PaginateModel } from 'mongoose';
import mongoosePagiante from 'mongoose-paginate-v2';

export type Avatar = {
	source: string;
	urls: string[];
};

export type User = {
	displayName?: string;
	avatar?: Avatar[];
	email: string;
	password: string;
	mobile?: string;
	isMobileVerfied?: boolean;
	isEmailVerified: boolean;
	pendingAvatarJobId?: string;
	avatarJobError?: string;
	githubId?: string;
};

const avatarSchema = new Schema(
	{
		source: { type: String, required: true, trim: true },
		urls: { type: [String], required: true, trim: true },
	},
	{ timestamps: false, versionKey: false, id: false, _id: false },
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
		password: {
			type: String,
			required: function () {
				return !this.githubId;
			},
			trim: true,
		},
		mobile: { type: String, required: false, default: undefined },
		isMobileVerfied: { type: Boolean, required: false, default: false },
		isEmailVerified: { type: Boolean, required: true, default: false },
		pendingAvatarJobId: {
			type: String,
			required: false,
			default: undefined,
		},
		avatarJobError: { type: String, required: false, default: undefined },
		githubId: { type: String, required: false },
	},
	{ versionKey: false },
);

userSchema.index({ githubId: 1 }, { unique: true, sparse: true });
userSchema.plugin(mongoosePagiante);

export type UserDocument = HydratedDocument<User>;
export const userModel = model<User, PaginateModel<User>>('user', userSchema);
