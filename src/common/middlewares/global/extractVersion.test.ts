import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { app } from '#app/core/app';

describe('extractVersion middleware', () => {
	const defaultVersion = '1';

	it('should return the correct version from X-API-Version header', async () => {
		const response = await request(app)
			.get('/api/health')
			.set('X-API-Version', '2');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe('2');
	});

	it('should return the correct version from Accept header', async () => {
		const response = await request(app)
			.get('/api/health')
			.set('Accept', 'application/vnd.myapp.v4+json');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe('4');
	});

	it('should return 400 for invalid version in X-API-Version header :  0 value', async () => {
		const response = await request(app)
			.get('/api/health')
			.set('X-API-Version', '0');

		expect(response.status).toBe(httpStatus.BAD_REQUEST);
		expect(response.body.error).toBe('Invalid X-API-Version header format');
	});

	it('should return 400 for invalid version in X-API-Version header :  non-numeric value', async () => {
		const response = await request(app)
			.get('/api/health')
			.set('X-API-Version', 'dummy');

		expect(response.status).toBe(httpStatus.BAD_REQUEST);
		expect(response.body.error).toBe('Invalid X-API-Version header format');
	});

	it('should return 400 for invalid version in X-API-Version header :  signed int value', async () => {
		const response = await request(app)
			.get('/health')
			.set('X-API-Version', '0');

		expect(response.status).toBe(httpStatus.BAD_REQUEST);
		expect(response.body.error).toBe('Invalid X-API-Version header format');
	});

	it('should return default version (1) for invalid version in Accept header :', async () => {
		const response = await request(app)
			.get('/api/health')
			.set('Accept', '0');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe(defaultVersion);
	});

	it('should return default version (1) when no version header provided', async () => {
		const response = await request(app).get('/api/health');

		expect(response.status).toBe(httpStatus.OK);
		expect(response.body.version).toBe(defaultVersion);
	});
});
