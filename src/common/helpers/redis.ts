// import { unwrap } from "#app/config/db/global";
// import { redis } from "#app/config/db/redis.config";

// /**
//  * Atomically increments `key` and, only on the first increment,
//  * sets its TTL to `ttlSec` seconds.
//  *
//  * @returns the new counter value
//  */
// export async function safeIncrWithTTL(
// 	key: string,
// 	ttlSec: string,
// ): Promise<number> {
// 	const lua = `
// 		local count = redis.call("INCR", KEYS[1])
// 		if count == 1 then
// 		redis.call("EXPIRE", KEYS[1], ARGV[1])
// 		end
// 		return count
//     `;

// 	// EVAL script: 1 key, then key and ttlSec
// 	const result = await redis.fire("eval", lua, 1, key, ttlSec);

// 	// unwrap will throw on circuit‐open or service‐error
// 	const count = unwrap(result) as number;
// 	return count;
// }
