import { z } from 'zod';
import { zBaseQuerySchema } from '#app/common/helpers/queryparser';

export const zNotesQuerySchema = zBaseQuerySchema.extend({
	tags: z.string().optional(),
});

export type NotesQuerySchema = z.infer<typeof zNotesQuerySchema>;
