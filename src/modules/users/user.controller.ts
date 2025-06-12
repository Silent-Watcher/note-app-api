import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { enqueueImage } from '#app/queues/imageQueue';
import { type IUserService, userService } from './user.service';

const createUserController = (service: IUserService) => ({
	async whoamI(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { id } = req.params;
			const user = await service.findById(id as string);
			if (!user) {
				res.sendError(httpStatus.NOT_FOUND, {
					code: 'NOT FOUND',
					message: 'user not found',
				});
				return;
			}
			res.sendSuccess(httpStatus.OK, { user });
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
		try {
			const { id } = req.params;
			const changes = req.body;
			let imageUploadJobId: undefined | string = undefined;

			const { acknowledged } = await service.updateOne(
				{ _id: id },
				changes,
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
				);
			}

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
			next(error);
		}
	},
});

export const userController = createUserController(userService);
