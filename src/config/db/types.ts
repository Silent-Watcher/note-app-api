import type { Types } from 'mongoose';

export type ID = Types.ObjectId | string;
export type ExistsResult = Promise<null | { _id: Types.ObjectId }>;
