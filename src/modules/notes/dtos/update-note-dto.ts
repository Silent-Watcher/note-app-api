import { z } from 'zod';
import { objectIdSchema } from '#app/common/validation/schemas/objectId.schema';

export const zUpdateNotesDto = z.object({
	title: z.string().trim().nonempty('title required').optional(),
	body: z.string().trim().nonempty('body required').optional(),
	pinned: z.boolean().optional().default(false),
	locked: z.boolean().optional().default(false),
	tags: z.array(objectIdSchema).optional(),
});

export type UpdateNotesDto = z.infer<typeof zUpdateNotesDto>;
