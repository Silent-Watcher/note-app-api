import { createServer } from 'node:http';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '#app/config';
import { app } from './app';

export function runServer(port: string = String(CONFIG.APP.PORT)): void {
	const server = createServer(app);
	server.listen(port, () => {
		logger.info(`server is up and running on port ${port}`);
	});
}
