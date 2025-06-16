import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { logger } from '#app/common/utils/logger.util';
import { enqueueImage } from '#app/queues/imageQueue';
import { type IUserService, userService } from './user.service';

const createUserController = (service: IUserService) => ({
	async whoamI(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			res.sendSuccess(httpStatus.OK, { user: req?.user });
			return;
		} catch (error) {
			next(error);
		}
	},

	async updateOne(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const session = await mongoose.startSession();
		try {
			const { id } = req.params;
			const changes = req.body;
			let imageUploadJobId: undefined | string = undefined;

			session.startTransaction();

			const { acknowledged } = await service.updateOne(
				{ _id: id },
				changes,
				session,
			);

			if (!acknowledged) {
				res.sendError(httpStatus.INTERNAL_SERVER_ERROR, {
					code: 'INTERNAL SERVER ERROR',
					message: 'update failed try again',
				});
				return;
			}

			if (req.file) {
				// quick MIME-type check
				if (!req.file.mimetype.startsWith('image/')) {
					res.sendError(httpStatus.UNSUPPORTED_MEDIA_TYPE, {
						code: 'UNSUPPORTED MEDIA TYPE',
						message: 'Unsupported file type',
					});
					return;
				}
				const job = await enqueueImage({
					buffer: req.file.buffer.toString('base64'),
					originalName: req.file.originalname,
					userId: req.user?._id.toString('hex') as string,
				});

				imageUploadJobId = job.id;

				await service.updateOne(
					{ _id: id },
					{
						$set: { pendingAvatarJobId: imageUploadJobId },
					},
					session,
				);
			}

			await session.commitTransaction();
			res.sendSuccess(httpStatus.ACCEPTED, {}, 'update success!', {
				...(req.file
					? {
							uploadImage: {
								jobId: imageUploadJobId,
								status: 'queued',
							},
						}
					: {}),
			});
			return;
		} catch (error) {
			await session.abortTransaction();
			logger.error(
				`Transaction aborted due to: ${(error as Error)?.message}`,
			);
			next(error);
		} finally {
			await session.endSession();
		}
	},
});

export const userController = createUserController(userService);
