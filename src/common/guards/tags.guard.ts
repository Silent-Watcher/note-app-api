import type { NextFunction, Request, Response } from 'express';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { tagsService } from '#app/modules/tags/tags.service';

export async function enforceTagsLimit(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const verifiedUser = req.user;

		if (!verifiedUser) {
			res.sendError(httpStatus.FORBIDDEN, {
				code: 'FORBIDDEN',
				message: 'user not found!',
			});
			return;
		}

		if (verifiedUser.isVip) {
			next();
			return;
		}

		const tagsNumber = await tagsService.countMatching({
			user: verifiedUser._id,
		});

		if (tagsNumber === 5) {
			res.sendError(httpStatus.FORBIDDEN, {
				code: 'FORBIDDEN',
				message:
					'You have reached the maximum number of tags allowed for non-vip users.',
			});
			return;
		}

		next();
	} catch (error) {
		next(error);
	}
}
