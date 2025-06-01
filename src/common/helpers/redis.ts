import { createHash } from 'node:crypto';
import type { Request } from 'express';
import stringify from 'fast-json-stable-stringify';
import type { RedisKey } from 'ioredis';
import { logger } from '#app/common/utils/logger.util';
import { unwrap } from '#app/config/db/global';
import type { CommandResult } from '#app/config/db/global';
import {
	type MultiExecResult,
	rawRedis,
	redis,
} from '#app/config/db/redis/redis.config';
import type { RedisSetOptions } from '#app/config/db/redis/types';
import { brotliCompressAsync, brotliDecompressAsync } from './compression';

export type BlockPrefix = 'recaptcha:block:ip' | 'login:block:ip';
export type FailurePrefix = 'recaptcha:failure:ip' | 'login:failure:ip';

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
		...(req?.query && Object.keys(req.query).length > 0
			? { query: req.query }
			: {}),
		user: req?.user?._id.toString('hex'),
		method: req.method,
	};

	const canonical = stringify(reqDataToHash);
	const hash = createHash('sha256').update(canonical).digest('hex');
	const cleanUrl = req.originalUrl.split('?')[0];

	return `${cleanUrl}@${hash}`;
}

export function isRedisWorking() {
	return rawRedis().status === 'ready';
}

export async function writeData(
	key: RedisKey,
	data: string | Buffer | number,
	options?: RedisSetOptions,
	compress?: boolean,
) {
	if (!isRedisWorking()) return;
	try {
		let payload: Buffer | string = '';
		if (compress) {
			payload =
				typeof data === 'number' ? Buffer.from(data.toString()) : data;
			const compressed = await brotliCompressAsync(payload);
			payload = compressed.toString('hex');
		} else {
			payload = typeof data === 'number' ? data.toString() : data;
		}

		const args = [
			key,
			payload,
			...(options ? buildRedisSetArgs(options) : []),
		];
		return unwrap(await redis.fire('set', ...args));
	} catch (error) {
		logger.error(`Redis write error: ${error}`);
	}
}

export async function readData(
	key: RedisKey,
	compress?: boolean,
): Promise<unknown | undefined> {
	if (!isRedisWorking()) return;

	try {
		const result = unwrap(
			(await redis.fire('get', key)) as CommandResult<unknown>,
		);
		if (result && compress) {
			const buffer = Buffer.from(result as string, 'hex');
			const decompress = await brotliDecompressAsync(buffer);
			return decompress.toString();
		}
		return result ?? undefined;
	} catch (error) {
		logger.error(`Redis read error: ${error}`);
		return;
	}
}

export async function isIpBlocked(
	ip: string,
	blockPrefix: BlockPrefix,
): Promise<boolean> {
	const blockKey = `${blockPrefix}-${ip}`;
	const isBlocked = unwrap(await redis.fire('get', blockKey));
	if (isBlocked) return true;
	return false;
}

export async function recordFailure(
	ip: string,
	failurePrefix: FailurePrefix,
	failureWindowSec: number,
	failureThreshold: number,
	blockPrefix: BlockPrefix,
	blockWindowSec: number,
): Promise<void> {
	const failureKey = `${failurePrefix}-${ip}`;
	const count = await safeIncrWithTTL(failureKey, failureWindowSec);

	// if too many failures, block the IP
	if (count >= failureThreshold) {
		const blockKey = `${blockPrefix}-${ip}`;
		const results = unwrap(
			await redis.fire('multi', [
				['set', blockKey, '1', 'EX', blockWindowSec],
				['del', failureKey],
			]),
		) as MultiExecResult;

		if (!results || results.length === 0) {
			logger.error('[REDIS TRANSACTION FAILED]');
			return;
		}

		for (let index = 0; index < results.length; index++) {
			const element = results[index] as NonNullable<
				Awaited<MultiExecResult>
			>[number];

			if (element[0]) {
				logger.error(`[REDIS TRANSACTION FAILED] : ${element[0]}`);
				return;
			}
		}

		logger.warn(
			`[${
				blockPrefix.split(':')[0]
			}][fraud] IP ${ip} blocked for ${blockWindowSec}s after ${count} failed attempts`,
		);
	}
}

/**
 * Reset failure count after a successful verify
 */
export async function resetFailures(
	ip: string,
	failurePrefix: FailurePrefix,
): Promise<void> {
	const failureKey = `${failurePrefix}-${ip}`;
	const foundedKey = unwrap(await redis.fire('get', failureKey));
	if (!foundedKey) return;
	await redis.fire('del', failureKey);
}
