import path from 'node:path';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import express from 'express';
import { extractVersion } from '#app/common/middlewares/extractVersion';
import { responseMiddleware } from '#app/common/middlewares/response';
import { CONFIG } from '.';

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
	app.use(express.json(), express.urlencoded({ extended: false }));

	app.set('view engine', 'ejs');
	app.set('views', path.join(process.cwd(), 'src', 'resources'));
	app.use(express.static(path.join(process.cwd(), 'public')));

	app.use(cookieParser(CONFIG.SECRET.COOKIE));

	app.use(extractVersion());

	app.use(responseMiddleware);
}
