import { Client } from 'minio';
import { CONFIG } from '#app/config';
import { logger } from '../logger.util';
export const minio = new Client({
	endPoint: CONFIG.MINIO.ENDPOINT,
	port: CONFIG.MINIO.PORT,
	useSSL: false,
	accessKey: CONFIG.MINIO.ACCESS_KEY,
	secretKey: CONFIG.MINIO.SECRET_KEY,
});

export async function ensureBucket(bucketName: string): Promise<void> {
	const exists = await minio.bucketExists(bucketName);
	if (!exists) {
		await minio.makeBucket(bucketName);
		logger.info(`[Minio Bucket] created: ${bucketName}`);
	}
}
