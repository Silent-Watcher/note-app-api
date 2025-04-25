import { _env } from './env.config';

export const CONFIG = Object.freeze({
	DEBUG: _env.APP_ENV,
	APP: Object.freeze({
		PORT: _env.APP_PORT,
	}),
	DB: Object.freeze({
		DEV: Object.freeze({
			HOST: _env.MONGO_HOST,
			PORT: _env.MONGO_PORT,
			USERNAME: _env.MONGO_USERNAME,
			PASSWORD: _env.MONGO_PASSWORD,
		}),
	}),
	LOGGER: Object.freeze({
		LEVEL: _env.LOG_LEVEL,
	}),
});
