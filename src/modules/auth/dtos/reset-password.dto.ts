import { z } from 'zod';

export const zResetPasswordDto = z
	.object({
		token: z.string().nonempty('Token is required'),
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long' }),
		confirmPassword: z
			.string()
			.min(8, { message: 'Please confirm your password' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'], // attaches the error to confirmPassword
	});

export type ResetPasswordDto = z.infer<typeof zResetPasswordDto>;
