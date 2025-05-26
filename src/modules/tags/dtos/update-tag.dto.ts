import mongoose from 'mongoose';
import { z } from 'zod';

export const zUpdateTagDto = z
	.object({
		name: z
			.string()
			.trim()
			.min(3, 'tag name should be at least 3 chars ')
			.optional(),
		color: z.string().trim().nonempty('color value required').optional(),
		parent: z.string().optional(),
	})
	.refine(
		(value) => {
			if (value.parent) {
				return mongoose.Types.ObjectId.isValid(value.parent as string);
			}
			return true;
		},
		{
			message: 'Invalid ObjectId string',
			path: ['parent'], // attaches the error to confirmPassword
		},
	);

export type UpdateTagDto = z.infer<typeof zUpdateTagDto>;
