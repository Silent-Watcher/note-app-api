import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';

export async function generateSecureToken(
	sizeBytes = 32,
): Promise<{ raw: string; hash: string }> {
	const raw = randomBytes(sizeBytes).toString('hex');
	const hash = await bcrypt.hash(raw, 10);
	return { raw, hash };
}
