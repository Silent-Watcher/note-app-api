import type { Request } from 'express';
import type { RedisKey } from 'ioredis';
import hash from 'object-hash';
import { logger } from '#app/common/utils/logger.util';
import { unwrap } from '#app/config/db/global';
import type { CommandResult } from '#app/config/db/global';
import { rawRedis, redis } from '#app/config/db/redis/redis.config';
import type { RedisSetOptions } from '#app/config/db/redis/types';

/**
 * Atomically increments `key` and, only on the first increment,
 * sets its TTL to `ttlSec` seconds.
 *
 * @returns the new counter value
 */
export async function safeIncrWithTTL(
	key: string,
	ttlSec: number,
): Promise<number> {
	const lua = `
		local count = redis.call("INCR", KEYS[1])
		if count == 1 then
		redis.call("EXPIRE", KEYS[1], ARGV[1])
		end
		return count
    `;

	// EVAL script: 1 key, then key and ttlSec
	const result = await redis.fire('eval', lua, 1, key, ttlSec.toString());

	// unwrap will throw on circuit‐open or service‐error
	const count = unwrap(result) as number;
	return count;
}

function buildRedisSetArgs(options: RedisSetOptions): (string | number)[] {
	const args: (string | number)[] = [];
	if (options.EX !== undefined) args.push('EX', options.EX);
	if (options.PX !== undefined) args.push('PX', options.PX);
	if (options.EXAT !== undefined) args.push('EXAT', options.EXAT);
	if (options.PXAT !== undefined) args.push('PXAT', options.PXAT);
	if (options.NX) args.push('NX');
	if (options.XX) args.push('XX');
	if (options.KEEPTTL) args.push('KEEPTTL');
	if (options.GET) args.push('GET');
	return args;
}

export function requestToKey(req: Request): string {
	const reqDataToHash = {
		...(req?.body ? { body: req.body } : {}),
		...(req?.query ? { query: req.query } : {}),
		user: req?.user?._id.toString('hex'),
	};

	return `${req.originalUrl}@${hash(reqDataToHash)}`;
}

export function isRedisWorking() {
	return rawRedis().status === 'ready';
}

export async function writeData(
	key: RedisKey,
	data: string | Buffer | number,
	options?: RedisSetOptions,
) {
	if (!isRedisWorking()) return;
	try {
		const args = [
			key,
			data,
			...(options ? buildRedisSetArgs(options) : []),
		];
		return unwrap(await redis.fire('set', ...args));
	} catch (error) {
		logger.error(`Redis write error: ${error}`);
	}
}

export async function readData(key: RedisKey): Promise<unknown | undefined> {
	if (!isRedisWorking()) return;

	try {
		const result = unwrap(
			(await redis.fire('get', key)) as CommandResult<unknown>,
		);
		return result ?? undefined;
	} catch (error) {
		logger.error(`Redis read error: ${error}`);
		return;
	}
}
