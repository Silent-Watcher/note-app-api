import { z } from 'zod';

/**
 * Zod schema for validating forgot password requests.
 *
 * Ensures the request body contains a valid email address.
 * - Trims whitespace.
 * - Returns a custom message if the email is invalid.
 */
export const zForgotPasswordDto = z.object({
	email: z.string().email({ message: 'Invalid email address' }).trim(),
});

export type ForgotPasswordDto = z.infer<typeof zForgotPasswordDto>;
