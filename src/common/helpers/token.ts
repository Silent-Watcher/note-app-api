import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';

/**
 * Generates a cryptographically secure random token and returns both the raw and hashed versions.
 *
 * This can be used for scenarios such as:
 * - Secure password reset tokens
 * - Email verification tokens
 * - One-time authentication tokens
 * @param {number} [sizeBytes=32] - The number of random bytes to generate for the token.
 *   Defaults to 32, which produces a 64-character hexadecimal string.
 */
export async function generateSecureToken(
	sizeBytes = 32,
): Promise<{ raw: string; hash: string }> {
	const raw = randomBytes(sizeBytes).toString('hex');
	const hash = await bcrypt.hash(raw, 10);
	return { raw, hash };
}
