import { z } from 'zod';

export const zBaseQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1).optional(),
	pageSize: z.coerce.number().int().positive().default(5).optional(),
	search: z.string().optional(),
	sort: z
		.union([
			z.string(), // e.g. 'title' or '-title'
			z.array(z.tuple([z.string(), z.enum(['asc', 'desc', '1', '-1'])])),
			z.record(z.string(), z.enum(['asc', 'desc', '1', '-1'])),
		])
		.optional(),
});
