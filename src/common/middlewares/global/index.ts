import path from 'node:path';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import express from 'express';
import { extractVersion } from '#app/common/middlewares/global/extractVersion';
import { responseMiddleware } from '#app/common/middlewares/global/response';
import { CONFIG } from '#app/config';

export function configureMiddleware(app: Application) {
	app.use(responseMiddleware);

	app.use(express.json({ limit: '100kb' }));
	app.use(express.urlencoded({ extended: true }));

	app.set('view engine', 'ejs');
	app.set('views', path.join(process.cwd(), 'src', 'resources'));
	app.use(
		express.static(path.join(process.cwd(), 'public'), { maxAge: '1d' }),
	);

	app.use(cookieParser(CONFIG.SECRET.COOKIE));
	app.use(extractVersion());
}
