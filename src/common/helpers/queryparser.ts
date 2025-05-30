import { z } from 'zod';

export const zBaseQuerySchema = z.object({
	page: z.coerce.number().int().positive().optional(),
	pageSize: z.coerce.number().int().positive().optional(),
	search: z.string().optional(),
	sort: z.string().optional(),
});
