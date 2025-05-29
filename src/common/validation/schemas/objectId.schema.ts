import mongoose from 'mongoose';
import { z } from 'zod';

export const objectIdSchema = z
	.string()
	.refine((val) => mongoose.Types.ObjectId.isValid(val), {
		message: 'Invalid ObjectId',
	});
