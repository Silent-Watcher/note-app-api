import { nanoid } from 'nanoid';
import type Mail from 'nodemailer/lib/mailer';
import { getQueue } from '.';

export const emailQueue = getQueue('email', {
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: 'exponential', delay: 5000 },
		removeOnComplete: true,
		removeOnFail: false,
	},
});

export function enqueueEmail(opts: Mail.Options) {
	const { from, to, subject, html } = opts;
	return emailQueue.add(
		'send',
		{
			from,
			to,
			subject,
			html,
		},
		{ jobId: nanoid() },
	);
}
