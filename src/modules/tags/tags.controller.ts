import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import type { Types } from 'mongoose';
import { httpStatus } from '#app/common/helpers/httpstatus';
import type { CreateTagDto } from './dtos/create-tag.dto';
import type { Tag } from './tags.model';
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
			const newTag = await service.create({
				color,
				name,
				parent,
				user: req.user?._id as Types.ObjectId,
			});

			res.sendSuccess(httpStatus.CREATED, { tag: newTag });
			return;
		} catch (error) {
			next(error);
		}
	},

	async deleteOne(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = req.params?.id as string;
			const { deletedCount } = await service.deleteOne(id);

			if (!deletedCount) {
				res.sendError(httpStatus.BAD_REQUEST, {
					code: 'BAD REQUEST',
					message: 'tag not found',
				});
			}

			res.sendSuccess(httpStatus.OK, {}, 'deleted successfully');
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
			const id = req.params.id as string;
			const changes = req.body as Partial<Tag>;
			const result = await service.updateOne(id, changes);
		} catch (error) {
			next(error);
		}
	},
});

export const tagsController = createTagsController(tagsService);
