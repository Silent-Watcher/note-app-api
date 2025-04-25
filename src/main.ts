import { connectToMongo } from '#app/config/db/mongo.condig';
import { logger } from './common/utils/logger.util';
import { runServer } from './core/server';

/**
 * Initializes the application by connecting to required services and starting the server.
 *
 * This block ensures that all essential asynchronous startup tasks are completed before
 * the server begins accepting requests.
 * and, upon successful connection, starts the server with `runServer()`.
 *
 * @async
 * @function
 * @returns {void}
 */
Promise.all([connectToMongo()])
	.then(() => {
		runServer();
	})
	.catch((err) => {
		logger.error(`Error starting the application: ${err.message}`);
		process.exit(1);
	});
