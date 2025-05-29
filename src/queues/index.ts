import type { QueueOptions } from 'bullmq';
import { Queue } from 'bullmq';
import { rawRedis } from '#app/config/db/redis/redis.config';

const queues = new Map();

export function getQueue(name: string, opts: Partial<QueueOptions>): Queue {
	if (queues.has(name)) return queues.get(name);
	const queue = new Queue(name, { connection: rawRedis(), ...opts });

	queues.set(name, queue);
	return queue;
}
