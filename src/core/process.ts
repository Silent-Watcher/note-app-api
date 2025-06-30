import { logger } from '#app/common/utils/logger.util';

export function setupProcessHandlers(options?: {
	exitOnError?: boolean;
	onError?: (
		type: 'uncaughtException' | 'unhandledRejection',
		error: unknown,
	) => void;
}) {
	const exit = options?.exitOnError ?? true;
	const onError = options?.onError;

	process.on('uncaughtException', (err) => {
		logger.error(`[🔥 Uncaught Exception]: ${err.message}`);
		if (onError) onError?.('uncaughtException', err);
		if (exit) process.exit(1);
	});

	process.on('unhandledRejection', (reason, promise) => {
		console.error('[💥 Unhandled Rejection]:', reason);
		if (onError) onError?.('unhandledRejection', reason);
		throw new Error((reason as string) ?? 'Unhandled Rejection');
	});

	process.on('SIGINT', () => {
		console.log('[🛑 SIGINT]: Graceful shutdown...');
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.log('[📴 SIGTERM]: Graceful shutdown...');
		process.exit(0);
	});
}
