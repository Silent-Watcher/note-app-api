import express from 'express';
import { router as apiRouter } from '#app/api/';
import { configureMiddleware } from '#app/common/middlewares/global';
import { configureErrorHandler } from '#app/common/middlewares/global/errorHandler';

export const app = express();

configureMiddleware(app);

app.get('/', (req, res, next) => {
	res.redirect('/api');
});

app.use('/api', apiRouter);

configureErrorHandler(app);
