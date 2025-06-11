import { z } from 'zod';

export const zCreateUserDto = z.object({
	displayName: z.string().trim().min(3).optional(),
});

export type CreateUserDto = z.infer<typeof zCreateUserDto>;
