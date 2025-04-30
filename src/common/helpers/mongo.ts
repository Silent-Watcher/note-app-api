import { Types, isValidObjectId } from 'mongoose';
import { createHttpError } from '#app/common/utils/http.util';
import { httpStatus } from './httpstatus';

/**
 * Converts a string to a Mongoose `ObjectId`.
 *
 * This function validates if the provided string is a valid MongoDB ObjectId. If the validation fails,
 * it throws an HTTP error with a 400 Bad Request status and a detailed error message.
 *
 * @param stringObjectId - The string representation of the ObjectId to convert.
 *
 * @throws {HttpError} Throws an error if the provided string is not a valid ObjectId.
 *
 * @returns {Types.ObjectId} The corresponding `ObjectId` instance.
 */
export function covertToObjectId(stringObjectId: string): Types.ObjectId {
	if (!isValidObjectId(stringObjectId)) {
		throw createHttpError(httpStatus.BAD_REQUEST, {
			message: 'invalid objectID value',
		});
	}

	return new Types.ObjectId(stringObjectId);
}
