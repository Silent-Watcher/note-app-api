import { randomBytes } from 'node:crypto';

// Generate a random 5-digit OTP
export function generateOtp(length: number): string {
	const otp = randomBytes(length).toString('hex').slice(0, 5);
	return otp;
}
