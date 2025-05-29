import { z } from 'zod';
import { objectIdSchema } from '#app/common/validation/schemas/objectId.schema';

export const zCreateNotesDto = z.object({
	title: z.string().trim().nonempty('title required'),
	body: z.string().trim().nonempty('body required'),
	pinned: z.boolean().optional().default(false),
	locked: z.boolean().optional().default(false),
	tags: z.array(objectIdSchema).optional(),
});

export type CreateNotesDto = z.infer<typeof zCreateNotesDto>;
