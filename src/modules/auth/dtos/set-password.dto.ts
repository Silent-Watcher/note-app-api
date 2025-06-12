import { z } from 'zod';

export const zSetPasswordDto = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long' }),
		confirmPassword: z
			.string()
			.min(8, { message: 'Please confirm your password' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type SetPasswordDto = z.infer<typeof zSetPasswordDto>;
