import { env } from 'node:process';
import pino from 'pino';

export const logger = pino({
	level: env.LOG_LEVEL,
});
