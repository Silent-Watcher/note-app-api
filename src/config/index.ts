import mongoose from 'mongoose';
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
		URL: `http://${_env.APP_HOST}:${_env.APP_PORT}`,
	}),

	DB: Object.freeze({
		HOST: _env.MONGO_HOST,
		PORT: _env.MONGO_PORT,
		USERNAME: _env.MONGO_USERNAME,
		PASSWORD: _env.MONGO_PASSWORD,
		REPLICASET: _env.MONGO_REPLICASET,
		DB_NAME: _env.MONGO_DATABASE,
	}),

	REDIS: Object.freeze({
		HOST: _env.REDIS_HOST,
		PORT: _env.REDIS_PORT,
		USERNAME: _env.REDIS_USERNAME,
		PASSWORD: _env.REDIS_PASSWORD,
	}),

	SECRET: Object.freeze({
		REFRESH_TOKEN: _env.REFRESH_TOKEN_SECRET,
		ACCESS_TOKEN: _env.ACCESS_TOKEN_SECRET,
		COOKIE: _env.COOKIE_SECRET,
	}),

	MAX_SESSION_DAYS: 7,

	EMAIL: Object.freeze({
		HOST: _env.EMAIL_HOST,
		PORT: _env.EMAIL_PORT,
		USER: _env.EMAIL_USER,
		PASS: _env.EMAIL_PASS,
		FROM_NAME: _env.EMAIL_FROM_NAME,
		FROM_ADDRESS: _env.EMAIL_FROM_ADDRESS,
	}),

	CLIENT_BASE_URL: _env.CLIENT_BASE_URL,

	ROUTE: Object.freeze({
		RESET_PASSWORD: _env.RESET_PASSWORD_ROUTE,
		LOGIN_PAGE_ROUTE: _env.LOGIN_PAGE_ROUTE,
	}),

	RECAPTCHA: Object.freeze({
		SITE_KEY: _env.RECAPTCHA_SITE_KEY,
		SECRET_KEY: _env.RECAPTCHA_SECRET_KEY,
		DEV_AUTH: _env.DEV_RECAPTCHA_AUTH,
	}),

	MINIO: Object.freeze({
		ACCESS_KEY: _env.MINIO_ACCESS_KEY,
		SECRET_KEY: _env.MINIO_SECRET_KEY,
		ENDPOINT: _env.MINIO_ENDPOINT,
		PORT: _env.MINIO_PORT,
		USE_SSL: _env.MINIO_USE_SSL,
	}),

	GITHUB: Object.freeze({
		CLIENT_ID: _env.GITHUB_CLIENT_ID,
		CLIENT_SECRET: _env.GITHUB_CLIENT_SECRET,
		CALLBACK_URL: _env.GITHUB_CALLBACK_URL,
		STATE_SECRET: _env.GITHUB_STATE_SECRET,
	}),

	JWT_ACCESS_SECRET: _env.JWT_ACCESS_SECRET,

	SIGHTENGINE: Object.freeze({
		API_SECRET: _env.SIGHTENGINE_API_SECRET,
		API_USER: _env.SIGHTENGINE_API_USER,
	}),
});
