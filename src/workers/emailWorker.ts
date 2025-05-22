import { Worker } from 'bullmq';
import type Mail from 'nodemailer/lib/mailer';
import { sendMail } from '#app/common/utils/email';
import { logger } from '#app/common/utils/logger.util';
import { rawRedis } from '#app/config/db/redis.config';

export const emailWorker = new Worker<Mail.Options>(
	'email',
	async (job) => {
		const { from, to, subject, html } = job.data;
		sendMail({ from, to, subject, html });
	},
	{ connection: rawRedis(), concurrency: 5 },
);

emailWorker.on('completed', (job) =>
	logger.info(`✅ Email job ${job.id} done`),
);
emailWorker.on('failed', (job, err) =>
	logger.info(`❌ Job ${job?.id ?? 'unknown'} failed: ${err.message}`),
);
