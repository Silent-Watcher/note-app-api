import { _env } from './env.config';

/**
 * Application configuration object, frozen to prevent modifications at runtime.
 *
 * @constant CONFIG
 * @type {object}
 * @property {string} DEBUG                - Current application environment ("development" | "test" | "production").
 * @property {Object} APP                  - Application-specific settings.
 * @property {number} APP.PORT             - Port on which the server will listen.
 * @property {Object} DB                   - Database connection settings.
 * @property {Object} DB.DEV               - Development database settings.
 * @property {string} DB.DEV.HOST          - MongoDB host for development.
 * @property {number} DB.DEV.PORT          - MongoDB port for development.
 * @property {string} DB.DEV.USERNAME      - Username for authenticating with MongoDB.
 * @property {string} DB.DEV.PASSWORD      - Password for authenticating with MongoDB.
 * @property {Object} LOGGER               - Logger configuration.
 * @property {string} LOGGER.LEVEL         - Minimum log level for the logger.
 */
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
});
