import { Types } from 'mongoose';
import { z } from 'zod';

export const zCreateTagDto = z
	.object({
		name: z.string().trim().min(3, 'tag name should be at least 3 chars '),
		color: z.string().trim().nonempty('color value required'),
		parent: z.instanceof(Types.ObjectId),
	})
	.strict();

export type CreateTagDto = z.infer<typeof zCreateTagDto>;
