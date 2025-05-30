import type { ConnectOptions, Mongoose } from 'mongoose';
import mongoose from 'mongoose';
import { CONFIG } from '#app/config';

import CircuitBreaker from 'opossum';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { logger } from '#app/common/utils/logger.util';
import type { CommandResult } from '../global';

export const MONGO_STATE_MAP: Record<number, string> = {
	0: 'DISCONNECTED',
	1: 'CONNECTED',
} as const;

export let mongoState = 0;

export const rawMongo: () => Promise<Mongoose> = (() => {
	let connectionPromise: Promise<Mongoose> | null = null;
	const MAX_RETRIES = 6;

	return (): Promise<Mongoose> => {
		if (!connectionPromise) {
			let attempts = 0;

			const uri = `mongodb://${CONFIG.DB.HOST}:${CONFIG.DB.PORT}/${CONFIG.DB.DB_NAME}`;
			const options: ConnectOptions = {
				serverSelectionTimeoutMS: 2000,
				auth: {
					username: CONFIG.DB.USERNAME,
					password: CONFIG.DB.PASSWORD,
				},
				authSource: 'admin',
				replicaSet: CONFIG.DB.REPLICASET,
			};
			const tryConnect = async (): Promise<Mongoose> => {
				try {
					attempts++;
					logger.info(`🔄 MongoDB connection attempt #${attempts}`);
					const conn = await mongoose.connect(uri, options);
					return conn;
				} catch (error) {
					if (attempts < MAX_RETRIES) {
						const backoff = attempts * 100;
						logger.warn(`⏱ Retrying in ${backoff}ms…`);
						await new Promise((r) => setTimeout(r, backoff));
						return tryConnect();
					}
					logger.error(
						`🛑 MongoDB gave up after ${attempts} attempts`,
					);

					throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
						code: 'DATABASE_ERROR',
						message:
							'Database connection failed after maximum attempts',
					});
				}
			};

			connectionPromise = tryConnect();

			mongoose.connection
				.on('connected', () => {
					mongoState = 1;
					logger.info('🌱 Mongoose connected');
				})
				.on('error', (err) =>
					logger.error('❌ Mongoose connection error', err),
				)
				.on('disconnected', () => {
					mongoState = 0;
					logger.warn('⚠️ Mongoose disconnected');
				});
		}
		return connectionPromise;
	};
})();

//
// 2) execMongoCommand: unwraps a callback that runs your actual DB logic
async function execMongoCommand<T>(
	command: () => Promise<T>,
): Promise<CommandResult<T>> {
	try {
		await rawMongo();
		const data = await command();
		return { ok: true, data };
	} catch (error) {
		if (CONFIG.DEBUG) {
			logger.error(`mongo error: ${error}`);
		}
		return { ok: false, reason: 'service-error' };
	}
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
		logger.warn(
			'⚠️ Circuit fallback triggered — DB temporarily unavailable',
		);
		return { ok: false, reason: 'circuit-open' };
	});

// if (CONFIG.DEBUG) {
// 	mongoose.set('debug', true);
// }
