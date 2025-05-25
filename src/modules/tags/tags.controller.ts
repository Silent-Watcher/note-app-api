import type { NextFunction, Request, Response } from 'express';
import type { Types } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { CreateTagDto } from './dtos/create-tag.dto';
import { type ITagsService, tagsService } from './tags.service';

const createTagsController = (service: ITagsService) => ({
	async getAll(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const tags = await service.getAll(req.user?.id);
			res.sendSuccess(httpStatus.OK, { tags });
			return;
		} catch (error) {
			next(error);
		}
	},

	async create(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { name, color, parent } = req.body as CreateTagDto;
			const newTag = await service.create(
				name,
				color,
				parent,
				req.user?._id as Types.ObjectId,
			);

			res.sendSuccess(httpStatus.CREATED, { tag: newTag });
			return;
		} catch (error) {
			next(error);
		}
	},
});

export const tagsController = createTagsController(tagsService);
