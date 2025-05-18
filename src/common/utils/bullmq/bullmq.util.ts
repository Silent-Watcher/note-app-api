import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from '#app/queues/emailQueue';

export const bullmqServerAdapter = new ExpressAdapter();
createBullBoard({
	queues: [new BullMQAdapter(emailQueue)],
	serverAdapter: bullmqServerAdapter,
});

bullmqServerAdapter.setBasePath('/api/superman/queues');
