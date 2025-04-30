import { description, name, version } from 'package.json';
import { _env } from './env.config';

/**
 * Application configuration object, frozen to prevent modifications at runtime.
 *
 * @constant CONFIG
 * @type {object}
 */
export const CONFIG = Object.freeze({
	DEBUG: _env.APP_ENV === 'development',
	APP: Object.freeze({
		PORT: _env.APP_PORT,
		NAME: name,
		DESCRIPTION: description,
		VERSION: version,
		HOST: _env.APP_HOST,
	}),
	DB: Object.freeze({
		DEV: Object.freeze({
			HOST: _env.MONGO_HOST,
			PORT: _env.MONGO_PORT,
			USERNAME: _env.MONGO_USERNAME,
			PASSWORD: _env.MONGO_PASSWORD,
		}),
	}),
	SECRET: {
		REFRESH_TOKEN: _env.REFRESH_TOKEN_SECRET,
		ACCESS_TOKEN: _env.ACCESS_TOKEN_SECRET,
		COOKIE: _env.COOKIE_SECRET,
	},
	MAX_SESSION_DAYS: 7,
});
