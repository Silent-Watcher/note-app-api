import type { NextFunction, Request, Response } from 'express';
import { notesService } from '#app/modules/notes/notes.service';
import { httpStatus } from '../helpers/httpstatus';

export async function enforceNotesLimit(
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

		const notesNumber = await notesService.countMatching({
			user: verifiedUser._id,
		});

		if (notesNumber === 5) {
			res.sendError(httpStatus.FORBIDDEN, {
				code: 'FORBIDDEN',
				message:
					'You have reached the maximum number of notes allowed for non-VIP users.',
			});
			return;
		}

		next();
	} catch (error) {
		next(error);
	}
}
