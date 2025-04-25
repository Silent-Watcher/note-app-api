import { env } from 'node:process';
import pino from 'pino';

export const levelNames = Object.keys(pino.levels.values) as Array<
	keyof typeof pino.levels.values
>;

export const logger = pino({
	level: env.LOG_LEVEL,
});
