import { Readable } from 'node:stream';
import { Worker } from 'bullmq';
import type { UpdateResult } from 'mongoose';
import sharp from 'sharp';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { clamscan } from '#app/common/utils/clamscan';
import { createHttpError } from '#app/common/utils/http.util';
import { logger } from '#app/common/utils/logger.util';
import { ensureBucket, minio } from '#app/common/utils/minio/client';
import { type CommandResult, unwrap } from '#app/config/db/global';
import { mongo } from '#app/config/db/mongo/mongo.condig';
import { rawRedis } from '#app/config/db/redis/redis.config';
import { userModel } from '#app/modules/users/user.model';
import type { UploadImageData } from '#app/queues/imageQueue';

const imageSizes = [
	{ suffix: 'thumb', width: 64, height: 64 },
	{ suffix: 'profile', width: 256, height: 256 },
	{ suffix: 'full', width: 1024, height: 1024 },
];

type AvatarImageData = {
	source: string;
	urls: string[];
};

const bucket = 'user-profiles';

export const imageWorker = new Worker<UploadImageData, AvatarImageData>(
	'profile-images',
	async (job) => {
		const { buffer: b64, originalName, userId } = job.data;
		// Decode the base64 string to a binary buffer
		const buf = Buffer.from(b64, 'base64');
		// Create a readable stream from the buffer
		const stream = Readable.from(buf);

		// 1: Virus scan
		const { isInfected, viruses } = await clamscan.scanStream(stream);
		if (isInfected) {
			throw createHttpError(httpStatus.BAD_REQUEST, {
				code: 'BAD REQUEST',
				message: `Virus found: ${viruses.join(', ')}`,
			});
		}
		await job.updateProgress(10);

		// 2:NSFW check with DeepStack

		await job.updateProgress(15);
		// 3:

		await ensureBucket(bucket);

		// 4: Resize & convert to WebP in parallel
		const uploadTasks = imageSizes.map(
			async ({ suffix, width, height }, index) => {
				const outBuf = await sharp(buf)
					.resize(width, height, { fit: 'cover' })
					.webp({ quality: 80 })
					.toBuffer();

				const objectName = `avatars/${userId}/${job.id}/${suffix}-${Date.now()}.webp`;
				await minio.putObject(bucket, objectName, outBuf);
				await job.updateProgress(
					Math.round((index + 1) / imageSizes.length) * 100,
				);
				return {
					url: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${objectName}`,
				};
			},
		);

		const uploads = await Promise.all(uploadTasks);

		const newAvatar = {
			source: 'upload',
			urls: uploads.flatMap(Object.values),
		};

		return newAvatar;
	},
	{ connection: rawRedis(), concurrency: 5 },
);

imageWorker.on('completed', async (job, result) => {
	logger.info(`Job ${job.id} completed`);
	unwrap(
		(await mongo.fire(() =>
			userModel.updateOne({ _id: job.data.userId }, [
				{ $unset: ['pendingAvatarJobId', 'avatarJobError'] },
				{
					$set: {
						avatar: {
							$let: {
								vars: {
									// “filtered” is the array of all avatars except any
									// whose source matches newAvatar.source
									filtered: {
										$filter: {
											input: '$avatar',
											as: 'item',
											cond: {
												$ne: [
													'$$item.source',
													result.source,
												],
											},
										},
									},
								},
								// concatenate the filtered avatars with [newAvatar]
								in: {
									$concatArrays: ['$$filtered', [result]],
								},
							},
						},
					},
				},
			]),
		)) as CommandResult<UpdateResult>,
	);
});

imageWorker.on('failed', async (job) => {
	try {
		logger.error(
			`upload avatar image job ${job?.id} failed: ${job?.failedReason}`,
		);

		// remove all files that uploaded!
		const objectPrefix = `avatars/${job?.data.userId}/${job?.id}/`;
		const toRemove: string[] = [];
		for await (const obj of minio.listObjectsV2(
			bucket,
			objectPrefix,
			true,
		)) {
			toRemove.push(obj);
		}

		if (toRemove.length) {
			await minio.removeObjects(bucket, toRemove);
			logger.info(
				`Cleaned up ${toRemove.length} orphaned files for job ${job?.id}`,
			);
		}

		const result = unwrap(
			(await mongo.fire(() =>
				userModel.updateOne(
					{ _id: job?.data.userId, pendingAvatarJobId: job?.id },
					{
						$unset: { pendingAvatarJobId: '' },
						$set: { avatarJobError: job?.failedReason },
					},
				),
			)) as CommandResult<UpdateResult>,
		);
	} catch (error) {
		logger.error(
			`Error during job failed handler: ${(error as Error)?.message}`,
		);
	}
});
