import { z } from 'zod';

export const zForgotPasswordDto = z.object({
	email: z.string().email({ message: 'Invalid email address' }).trim(),
});

export type ForgotPasswordDto = z.infer<typeof zForgotPasswordDto>;
