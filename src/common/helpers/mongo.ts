import { Types, isValidObjectId } from 'mongoose';
import { createHttpError } from '#app/common/utils/http.util';
import { httpStatus } from './httpstatus';

export function covertToObjectId(stringObjectId: string): Types.ObjectId {
	if (!isValidObjectId(stringObjectId)) {
		throw createHttpError(httpStatus.BAD_REQUEST, {
			message: 'invalid objectID value',
		});
	}

	return new Types.ObjectId(stringObjectId);
}
