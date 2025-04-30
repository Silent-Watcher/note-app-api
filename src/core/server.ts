import { createServer } from 'node:http';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '#app/config';
import { app } from './app';

/**
 * Starts the HTTP server on the specified port.
 *
 * This function creates an HTTP server using the provided `app` (typically an Express app),
 * and begins listening on the given port. Once the server starts successfully, a message is
 * logged to the console indicating that the server is running.
 *
 * @function
 * @param {string} [port=env.APP_PORT] - The port number on which the server should listen.
 * If not provided, it defaults to the `APP_PORT` environment variable.
 *
 * @returns {void}
 */
export function runServer(port: string = String(CONFIG.APP.PORT)): void {
	const server = createServer(app);
	server.listen(port, () => {
		logger.info(`server is up and running on port ${port}`);
	});
}
