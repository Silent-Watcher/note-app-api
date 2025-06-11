import type { Job } from 'bullmq';
import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { imageQueue } from '#app/queues/imageQueue';

const queuesRouterV1 = Router();

queuesRouterV1.get(
	'/images/:jobId',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { jobId } = req.params;

			const job = (await imageQueue.getJob(jobId as string)) as Job;

			if (!job) {
				res.sendError(httpStatus.NOT_FOUND, {
					code: 'NOT FOUND',
					message: 'job not found',
				});
				return;
			}

			const state = await job.getState();
			const response: Record<string, unknown> = { status: state };

			if (state === 'failed') {
				response.error = job.failedReason;
			} else if (state === 'completed') {
				response.result = job.returnvalue;
			} else {
				response.progress = job.progress;
			}

			res.sendSuccess(httpStatus.OK, { job: { ...response } });
			return;
		} catch (error) {
			next(error);
		}
	},
);

export { queuesRouterV1 };
