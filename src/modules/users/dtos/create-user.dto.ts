import { z } from 'zod';

/**
 * Data Transfer Object for user registration.
 *
 * @typedef {Object} CreateUserDto
 * @property {string} email           - The user's email address (must be valid).
 * @property {string} password        - The user's password (min. 8 characters).
 * @property {string} confirmPassword - Confirmation of the password; must match `password`.
 */

/**
 * Zod schema to validate the incoming `CreateUserDto`.
 * - Ensures `email` is a valid email string.
 * - Enforces `password` and `confirmPassword` to be at least 8 characters.
 * - Checks that `password === confirmPassword`.
 */
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
