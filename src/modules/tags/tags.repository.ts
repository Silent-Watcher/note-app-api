import { createBaseRepository } from '#app/config/db/mongo/repository';
import type { Tag, TagDocument } from './tags.model';
import { tagModel } from './tags.model';
export interface ITagsRepository
	extends ReturnType<typeof createBaseRepository<Tag, TagDocument>> {}

const base = createBaseRepository<Tag, TagDocument>(tagModel);

const createTagsRepository = () => ({
	...base,
});

export const tagsRepository = createTagsRepository();
