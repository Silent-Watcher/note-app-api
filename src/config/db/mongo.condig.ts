import mongoose from 'mongoose';
import { CONFIG } from '#app/config';

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 *
 * This function attempts to connect to a MongoDB instance using credentials and configuration
 * provided via environment variables. It sets a short server selection timeout to fail fast
 * if the database is unreachable.
 *
 * Environment variables used:
 * - `MONGO_HOST`: The hostname or IP address of the MongoDB server.
 * - `MONGO_PORT`: The port on which MongoDB is running.
 * - `MONGO_USERNAME`: The username for authentication.
 * - `MONGO_PASSWORD`: The password for authentication.
 *
 * @function
 * @returns {Promise<typeof import("mongoose")>} A promise that resolves when the connection is successful.
 */
export function connectToMongo() {
	return mongoose.connect(
		`mongodb://${CONFIG.DB.DEV.HOST}:${CONFIG.DB.DEV.PORT}`,
		{
			serverSelectionTimeoutMS: 2000,
			auth: {
				username: CONFIG.DB.DEV.USERNAME,
				password: CONFIG.DB.DEV.PASSWORD,
			},
		},
	);
}
