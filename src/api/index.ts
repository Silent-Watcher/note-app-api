import { Router } from 'express';
import { loadRouter } from '#app/common/helpers/loadRouter';

/**
 * Initializes and loads the Express router.
 *
 * This code uses the `loadRouter` helper function to configure and load the router,
 * allowing for modular route loading in the application. The `Router()` from `express`
 * is passed as the parameter to define the routes for the application.
 *
 * @constant {Router} router - The configured Express router instance with routes loaded.
 */
export const router = loadRouter(Router());
