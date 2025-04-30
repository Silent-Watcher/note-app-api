import { describe, expect, it } from 'vitest';
import { httpStatus } from './httpstatus';

describe('httpStatus helper', () => {
	it('should return 200 for OK', () => {
		const sut = httpStatus;
		const expected = 200;

		const actual = sut.OK;
		expect(actual).toBe(expected);
	});

	it('should return OK for 200', () => {
		const sut = httpStatus;
		const expected = 'OK';

		const actual = (sut as Record<number, string>)[200];
		expect(actual).toBe(expected);
	});
});
