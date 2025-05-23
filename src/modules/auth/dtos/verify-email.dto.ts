import { z } from 'zod';

export const zVerifyEmailDto = z.object({
	email: z.string().email({ message: 'Invalid email address' }).trim(),
	code: z
		.string()
		.length(5, 'OTP must be exactly 5 characters')
		.regex(/^[A-Za-z0-9]{5}$/, 'OTP must be alphanumeric'),
});

export type VerifyEmailDto = z.infer<typeof zVerifyEmailDto>;
