import { z } from 'zod';

/**
 * Zod schema for validating user login requests.
 *
 * Ensures the request body includes:
 * - A valid, trimmed email address.
 * - A password with a minimum length of 8 characters.
 */
export const zLoginUserDto = z.object({
	email: z.string().email({ message: 'Invalid email address' }).trim(),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long' }),
});

export type LoginUserDto = z.infer<typeof zLoginUserDto>;
