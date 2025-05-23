import { safeIncrWithTTL } from '#app/common/helpers/redis';
import { unwrap } from '#app/config/db/global';
import type { MultiExecResult } from '#app/config/db/redis.config';
import { redis } from '#app/config/db/redis.config';
import { logger } from '../logger.util';

const FAILURE_PREFIX = 'recaptcha:fail:ip-';
const THRESHOLD = 5; // max allowed failures
const WINDOW_SEC = 60 * 60; // rolling window for failures (1h)
const BLOCK_PREFIX = 'recaptcha:block:ip-';
const BLOCK_SEC = 60 * 60 * 24; // block duration (24h)

/**
 * @returns true if IP is currently blocked
 */
export async function isBlocked(ip: string): Promise<boolean> {
	const blockKey = BLOCK_PREFIX + ip;
	const isBlocked = unwrap(await redis.fire('get', blockKey));

	if (isBlocked) {
		return true;
	}

	return false;
}

export async function recordFailure(ip: string): Promise<void> {
	const failureKey = FAILURE_PREFIX + ip;

	// increment failures, set expiry if first time
	// ? race condition danger
	// const count = unwrap(await redis.fire("incr", failureKey)) as number;
	// if (count === 1) {
	// 	await redis.fire("expire", failureKey, WINDOW_SEC);
	// }

	const count = await safeIncrWithTTL(failureKey, WINDOW_SEC);

	// if too many failures, block the IP
	if (count >= THRESHOLD) {
		// ? bad code:
		// await redis.fire("set", BLOCK_PREFIX + ip, "1", "EX", BLOCK_SEC);
		// await redis.fire("del", failureKey);
		// ? better code:
		const results = unwrap(
			await redis.fire('multi', [
				['set', BLOCK_PREFIX + ip, '1', 'EX', BLOCK_SEC],
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
			`[recaptcha][fraud] IP ${ip} blocked for ${BLOCK_SEC}s after ${count} failed attempts`,
		);
	}
}

/**
 * Reset failure count after a successful verify
 */
export async function resetFailures(ip: string): Promise<void> {
	await redis.fire('del', FAILURE_PREFIX + ip);
}

// // import { safeIncrWithTTL } from "#app/common/helpers/redis";
// // import { unwrap } from "#app/config/db/global";
// // import type { MultiExecResult } from "#app/config/db/redis.config";
// // import { redis } from "#app/config/db/redis.config";
// import { logger } from "../logger.util";

// const FAILURE_PREFIX = (ip: string) => `recaptcha:fail:ip-${ip}`;
// const THRESHOLD = 5; // max allowed failures
// const WINDOW_SEC = 60 * 60; // rolling window for failures (1h)
// const BLOCK_PREFIX = (ip: string) => `recaptcha:block:ip-${ip}`;
// const BLOCK_SEC = 60 * 60 * 24; // block duration (24h)

// /**
//  * @returns true if IP is currently blocked
//  */
// export async function isBlocked(ip: string): Promise<boolean> {
// 	const blockKey = BLOCK_PREFIX(ip);
// 	const isBlocked = unwrap(await redis.fire("get", blockKey));

// 	if (isBlocked) {
// 		return true;
// 	}

// 	return false;
// }

// export async function recordFailure(ip: string): Promise<void> {
// 	const failureKey = FAILURE_PREFIX(ip);

// 	// increment failures, set expiry if first time
// 	// ? race condition danger
// 	// const count = unwrap(await redis.fire("incr", failureKey)) as number;
// 	// if (count === 1) {
// 	// 	await redis.fire("expire", failureKey, WINDOW_SEC);
// 	// }

// 	const count = await safeIncrWithTTL(failureKey, WINDOW_SEC.toString());

// 	// if too many failures, block the IP
// 	if (count >= THRESHOLD) {
// 		// ? bad code:
// 		// await redis.fire("set", BLOCK_PREFIX(ip), "1", "EX", BLOCK_SEC);
// 		// await redis.fire("del", failureKey);
// 		// ? better code:
// 		const results = unwrap(
// 			await redis.fire("multi", [
// 				["set", BLOCK_PREFIX(ip), "1", "EX", BLOCK_SEC],
// 				["del", failureKey],
// 			]),
// 		) as MultiExecResult;

// 		if (!results || results.length === 0) {
// 			logger.error("[REDIS TRANSACTION FAILED]");
// 			return;
// 		}

// 		for (let index = 0; index < results.length; index++) {
// 			const element = results[index] as NonNullable<
// 				Awaited<MultiExecResult>
// 			>[number];

// 			if (element[0]) {
// 				logger.error(`[REDIS TRANSACTION FAILED] : ${element[0]}`);
// 				return;
// 			}
// 		}

// 		logger.warn(
// 			`[recaptcha][fraud] IP ${ip} blocked for ${BLOCK_SEC}s after ${count} failed attempts`,
// 		);
// 	}
// }

// /**
//  * Reset failure count after a successful verify
//  */
// export async function resetFailures(ip: string): Promise<void> {
// 	await redis.fire("del", FAILURE_PREFIX(ip));
// }
