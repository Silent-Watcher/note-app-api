import express from 'express';
import { router as apiRouter } from '#app/api/';
import { configureMiddleware } from '#app/common/middlewares/global';
import { configureErrorHandler } from '#app/common/middlewares/global/errorHandler';

export const app = express();

/**
 * Apply all global middleware, view engine setup, and static file serving
 * configurations to the given Express application instance.
 *
 * This function centralizes:
 *  - Body parsers (`express.json()`, `express.urlencoded`)
 *  - View engine (`ejs`) and views directory
 *  - Static assets directory
 *  - Any additional application-wide middleware (CORS, helmet, sessions, etc.)
 *
 * @param {import('express').Express} app - The Express application to configure.
 * @returns {void}
 */
configureMiddleware(app);

/**
 * GET /
 * Redirects the root route to /api.
 *
 * @route GET /
 */
app.get('/', (req, res, next) => {
	res.redirect('/api');
});

/**
 * Mount the main API router.
 *
 * This router handles all API endpoints, typically grouped by version and feature.
 * Should be mounted after global middlewares (like extractVersion and responseMiddleware).
 */
app.use('/api', apiRouter);

/**
 * Attach global error handling middleware to the given Express application.
 *
 * This function sets up:
 *  - A 404 Not Found handler for unmatched routes
 *  - A centralized error handler to format and respond to thrown errors
 *  - Any additional error-logging or reporting middleware
 *
 * @param {import("express").Application} app - The Express application instance to configure error handling on.
 * @returns {void}
 */
configureErrorHandler(app);
