import path from 'node:path';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import express from 'express';
import { extractVersion } from '#app/common/middlewares/global/extractVersion';
import { responseMiddleware } from '#app/common/middlewares/global/response';
import { CONFIG } from '#app/config';
import { rawMongo } from '#app/config/db/mongo.condig';
import { rawRedis } from '#app/config/db/redis.config';

/**
 * Configure and attach all global middleware, view engine settings,
 * and static asset serving to the provided Express application.
 *
 * This includes:
 *  - Body parsing (JSON and URL-encoded)
 *  - EJS view engine with views directory
 *  - Static file serving from the `public` directory
 *  - Cookie parsing using a configured secret
 *  - API version extraction middleware
 *  - Standard response formatting middleware
 *
 * @param {Application} app - The Express application instance to configure.
 * @returns {void}
 */
export function configureMiddleware(app: Application) {
	// built-ins
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.use(responseMiddleware);

	// view engine / static
	app.set('view engine', 'ejs');
	app.set('views', path.join(process.cwd(), 'src', 'resources'));
	app.use(express.static(path.join(process.cwd(), 'public')));

	// cookies, versioning, etc.
	app.use(cookieParser(CONFIG.SECRET.COOKIE));
	app.use(extractVersion());

	// app.use(async (req, res, next) => {
	// 	try {
	// 		await rawMongo();
	// 		rawRedis();
	// 		next();
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// });
}
