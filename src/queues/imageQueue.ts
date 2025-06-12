import { nanoid } from 'nanoid';
import { getQueue } from '.';

export type UploadImageData = {
	userId: string;
	buffer: string;
	originalName: string;
};

export const imageQueue = getQueue('profile-images', {
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: 'exponential', delay: 5000 },
		removeOnComplete: false,
		removeOnFail: false,
	},
});

export function enqueueImage(imageData: UploadImageData) {
	return imageQueue.add(
		'process-avatar',
		{
			userId: imageData.userId,
			buffer: imageData.buffer,
			originalName: imageData.originalName,
		},
		{ jobId: nanoid() },
	);
}
