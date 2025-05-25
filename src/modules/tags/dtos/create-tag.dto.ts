import mongoose from 'mongoose';
import { z } from 'zod';

export const zCreateTagDto = z
	.object({
		name: z.string().trim().min(3, 'tag name should be at least 3 chars '),
		color: z.string().trim().nonempty('color value required'),
		parent: z.string(),
	})
	.refine((value) => mongoose.Types.ObjectId.isValid(value.parent), {
		message: 'Invalid ObjectId string',
		path: ['parent'], // attaches the error to confirmPassword
	});

export type CreateTagDto = z.infer<typeof zCreateTagDto>;
