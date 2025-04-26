import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { app } from '#app/core/app';

describe('routing base on the api version', () => {
	it('should respond with v1 handler for version 1', async () => {
		const response = await request(app)
			.get('/')
			.set('Accept', 'application/vnd.myapp.v1+json');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe('1');
	});

	it('should respond with v2 handler for version 2', async () => {
		const response = await request(app)
			.get('/')
			.set('Accept', 'application/vnd.myapp.v2+json');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe('2');
	});

	it('should respond with v1 handler if no version specified', async () => {
		const response = await request(app).get('/');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe('1');
	});
});
