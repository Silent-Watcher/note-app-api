import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';

export type CommandResult<T> =
	| { ok: true; data: T }
	| { ok: false; reason: 'circuit-open' | 'service-error' };

export function unwrap<T>(result: CommandResult<T>): T {
	if (!result.ok) {
		if (result.reason === 'circuit-open') {
			throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
				code: 'DATABASE_ERROR',
				message: 'Circuit open — service unavailable',
			});
		}
		if (result.reason === 'service-error') {
			throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
				code: 'DATABASE_ERROR',
				message: 'Service error occurred',
			});
		}
	} else {
		return result.data;
	}
	throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
		code: 'DATABASE_ERROR',
		message: 'Unexpected result type',
	});
}
