import dayjs from 'dayjs';
import type { ClientSession, Types } from 'mongoose';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo/mongo.condig';
import { type OtpDocument, otpModel } from '../models/otp.model';

export interface IOtpRepository {
	create(
		type: 'email_verification',
		code: string,
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<OtpDocument>;

	getLatestUnusedVerifyEmailOtp(
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<OtpDocument | null>;
}

const createotpRepository = () => ({
	async create(
		type: 'email_verification',
		code: string,
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<OtpDocument> {
		const result = unwrap(
			(await mongo.fire(() => {
				const doc = new otpModel({
					type,
					code,
					userId,
					expiresAt: dayjs().add(5, 'minutes').toDate(),
				});
				return doc.save({ session });
			})) as CommandResult<OtpDocument>,
		);

		return result;
	},

	async getLatestUnusedVerifyEmailOtp(
		userId: Types.ObjectId,
		session?: ClientSession,
	): Promise<OtpDocument | null> {
		return unwrap(
			(await mongo.fire(() =>
				otpModel.findOne(
					{
						userId,
						used: false,
						type: 'email_verification',
					},
					null,
					{ session },
				),
			)) as CommandResult<OtpDocument | null>,
		);
	},
});

export const otpRepository = createotpRepository();
