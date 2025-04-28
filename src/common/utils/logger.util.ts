import { env } from 'node:process';
import pino from 'pino';

export const logger = pino({
	level: env.LOG_LEVEL,
});

/**
 * An array of all available log levels defined by Pino.
 *
 * This is useful for dynamically checking or working with log levels.
 * Example levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
 */
export const levelNames = Object.keys(pino.levels.values) as Array<
	keyof typeof pino.levels.values
>;
