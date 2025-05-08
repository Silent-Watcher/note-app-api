import Redis from 'ioredis';
import CircuitBreaker from 'opossum';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '..';

export const rawRedis: () => Redis = (() => {
	let client: Redis | null = null;
	const MAX_RETRIES = 6;
	return () => {
		if (!client) {
			client = new Redis({
				host: CONFIG.REDIS.HOST,
				port: CONFIG.REDIS.PORT,
				password: CONFIG.REDIS.PASSWORD,
				username: CONFIG.REDIS.USERNAME,
				tls: {},
				retryStrategy(times) {
					if (times > MAX_RETRIES) {
						logger.error(
							`🔌 Redis gave up after ${MAX_RETRIES}retries`,
						);
						return null; // stop retrying
					}
					// otherwise wait a bit before next retry
					const delay = Math.min(times * 500, 3000);
					logger.warn(
						`🔁 Redis retry #${times}, delaying ${delay}ms`,
					);
					return delay;
				},
				// Prevent endless per-command retries
				maxRetriesPerRequest: 1,
			});

			client.once('connect', () => logger.info('🌱 Redis connected'));
			client.on('error', (err) =>
				logger.error(`🚨 Redis error ${err.message}`),
			);
		}
		return client;
	};
})();

/**
 * Execute an arbitrary Redis command.
 * @param cmd  — the Redis command name, e.g. "get", "set", "incr"
 * @param args — arguments for that command
 */
async function execRedisCommand(
	cmd: keyof Redis,
	...args: unknown[]
): Promise<unknown> {
	const client = rawRedis();
	return (client[cmd] as (...args: unknown[]) => Promise<unknown>)(...args);
}

// Circuit breaker options
const breakerOptions = {
	timeout: 3000, // if a command takes > 3s, consider it a failure
	errorThresholdPercentage: 50, // % of failures to open the circuit
	resetTimeout: 30_000, // after 30s, try a command again (half-open)
};

/**
 * A “simple” Redis façade over rawRedis, wrapped in a circuit breaker.
 * Use this for your normal GET/SET/INCR calls in request handlers.
 */
export const redis = new CircuitBreaker(execRedisCommand, breakerOptions)
	.on('open', () => logger.warn('🚧 Redis circuit OPEN - fallback triggered'))
	.on('halfOpen', () => logger.info('🔄 Redis circuit HALF-OPEN'))
	.on('close', () => logger.info('✅ Redis circuit CLOSED'))
	.on('failure', (err) => {
		logger.error(`🚨 Redis command failed ${err.message}`);
	})
	.fallback(() => null); // return null if circuit is open;
