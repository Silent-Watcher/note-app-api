import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { type ITagsService, tagsService } from './tags.service';

const createTagsController = (service: ITagsService) => ({
	async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const tags = await service.getAll(req.user?.id);
			res.sendSuccess(httpStatus.OK, { tags });
			return;
		} catch (error) {
			next(error);
		}
	},
});

export const tagsController = createTagsController(tagsService);
