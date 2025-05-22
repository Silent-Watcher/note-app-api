import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { app } from '#app/core/app';

describe('Health Check Endpoint', () => {
	it('should respond with 200 OK and expected JSON body', async () => {
		const response = await request(app)
			.get('/api/health')
			.expect(httpStatus.OK);

		expect(response.body).toHaveProperty('code', httpStatus.OK);
		expect(response.body.meta.server.status).toBe('OK');
	});
});
