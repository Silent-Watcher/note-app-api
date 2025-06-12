import { z } from 'zod';

export const zCreateUserDto = z
	.object({
		email: z.string().email({ message: 'Invalid email address' }).trim(),
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

export type CreateUserDto = z.infer<typeof zCreateUserDto>;
