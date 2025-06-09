import { z } from 'zod';
import { zBaseQuerySchema } from '#app/common/helpers/queryparser';

export const zTagsQuerySchema = zBaseQuerySchema.extend({
	color: z.string().trim().nonempty('color value required').optional(),
});

export type TagsQuerySchema = z.infer<typeof zTagsQuerySchema>;
