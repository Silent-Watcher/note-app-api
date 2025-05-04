import { z } from 'zod';

/**
 * Zod schema for validating password reset requests.
 *
 * Ensures the request body includes:
 * - A non-empty reset token.
 * - A password with a minimum length of 8 characters.
 * - A confirmPassword field that:
 *   - Has a minimum length of 8 characters.
 *   - Must match the password field.
 *
 * Custom error messages are provided for all validations, and mismatched passwords
 * return an error attached to the `confirmPassword` field.
 */
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
