import mongoose from 'mongoose';
import type { Mongoose } from 'mongoose';
import { CONFIG } from '#app/config';

import CircuitBreaker from 'opossum';
import { logger } from '#app/common/utils/logger.util';

export const rawMongo: () => Promise<Mongoose> = (() => {
	let connectionPromise: Promise<Mongoose> | null = null;
	const MAX_RETRIES = 6;

	return (): Promise<Mongoose> => {
		if (!connectionPromise) {
			let attempts = 0;

			const uri = `mongodb://${CONFIG.DB.HOST}:${CONFIG.DB.PORT}`;
			const options = {
				serverSelectionTimeoutMS: 2000,
				auth: {
					username: CONFIG.DB.USERNAME,
					password: CONFIG.DB.PASSWORD,
				},
			};
			const tryConnect = async (): Promise<Mongoose> => {
				try {
					attempts++;
					logger.info(`🔄 MongoDB connection attempt #${attempts}`);
					const conn = await mongoose.connect(uri, options);
					return conn;
				} catch (error) {
					if (attempts < MAX_RETRIES) {
						const backoff = attempts * 1000;
						logger.warn(`⏱ Retrying in ${backoff}ms…`);
						await new Promise((r) => setTimeout(r, backoff));
						return tryConnect();
					}
					logger.error(
						`🛑 MongoDB gave up after ${attempts} attempts`,
					);
					throw error;
				}
			};

			connectionPromise = tryConnect();

			mongoose.connection
				.on('connected', () => logger.info('🌱 Mongoose connected'))
				.on('error', (err) =>
					logger.error('❌ Mongoose connection error', err),
				)
				.on('disconnected', () =>
					logger.warn('⚠️ Mongoose disconnected'),
				);
		}
		return connectionPromise;
	};
})();

//
// 2) execMongoCommand: unwraps a callback that runs your actual DB logic
//
async function execMongoCommand<T>(
	command: () => Promise<T>,
): Promise<T | null> {
	await rawMongo();
	return CONFIG.DB.STATE === 1 ? command() : null;
}

//
// 3) circuit breaker around execMongoCommand
//
const breakerOptions = {
	timeout: 2000, // ms before timing out a DB call
	errorThresholdPercentage: 50, // % failures to open circuit
	resetTimeout: 30_000, // how long to wait before trying again
};

export const mongo = new CircuitBreaker(execMongoCommand, breakerOptions)
	.on('open', () => logger.warn('🚧 MongoDB circuit OPEN — falling back'))
	.on('halfOpen', () => logger.info('🔄 MongoDB circuit HALF-OPEN'))
	.on('close', () => logger.info('✅ MongoDB circuit CLOSED'))
	.on('failure', (err) =>
		logger.error('🚨 Mongo command failed:', err.message),
	)
	.fallback(() => {
		// you can return `null`, `[]`, or an empty object depending on operation
		return null as unknown;
	});
