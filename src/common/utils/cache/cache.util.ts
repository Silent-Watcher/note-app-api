import type { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { httpStatus } from '#app/common/helpers/httpstatus';
import {
	isRedisWorking,
	readData,
	requestToKey,
	writeData,
} from '#app/common/helpers/redis';
import type { RedisSetOptions } from '#app/config/db/redis/types';

export function cache(options: RedisSetOptions = { EX: 60 }) {
	return asyncHandler(
		async (
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> => {
			try {
				if (!isRedisWorking) {
					next();
					return;
				}
				const key = requestToKey(req);
				const cachedData = await readData(key, true);

				if (cachedData) {
					let payload: unknown;
					try {
						payload = JSON.parse(cachedData as string);
					} catch (error) {
						payload = cachedData;
					}
					res.sendSuccess(
						httpStatus.OK,
						{ ...(payload as object) },
						undefined,
						{ source: 'cache' },
					);
					return;
				}

				const originalSendSuccess = res.sendSuccess.bind(res);

				res.sendSuccess = (status, data, message, meta?) => {
					if (status.toString().startsWith('2')) {
						writeData(
							key,
							JSON.stringify(data),
							options,
							true,
						).then();
					}
					return originalSendSuccess(status, data, message, meta);
				};

				next();
			} catch (error) {
				next(error);
			}
		},
	);
}
