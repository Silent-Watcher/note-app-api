import type {
	ClientSession,
	DeleteResult,
	FilterQuery,
	HydratedDocument,
	// Model,
	PaginateModel,
	PaginateOptions,
	PaginateResult,
	PopulateOptions,
	ProjectionType,
	SortOrder,
	UpdateQuery,
	UpdateResult,
} from 'mongoose';
import { type CommandResult, unwrap } from '../global';
import { mongo } from './mongo.condig';
import type { ExistsResult } from './types';

interface PaginationOptions {
	page?: number;
	pageSize?: number;
}

/** Sort by any key in your schema T */
type SortBy<T> =
	/** { field1?: 1|-1; field2?: 1|-1; … } */
	| (Partial<Record<Extract<keyof T, string>, SortOrder>> & {
			score?: { $meta: 'textScore' };
	  })
	/** or array-of-tuples: [ ["field1", 1], ["field2", -1], … ] */
	| [Extract<keyof T, string>, SortOrder][];

/**
 * Fully-typed options for `getAll()`.
 * - `T` is your raw schema shape (e.g. `Note`).
 * - `Doc` is the hydrated Mongoose document (i.e. `HydratedDocument<T>`).
 */
export interface MongoQueryOptions<T, Doc extends HydratedDocument<T>> {
	/** any Mongoose‐style filter on T’s fields */
	filter?: FilterQuery<Doc>;
	/** include/exclude fields of T */
	projection?: ProjectionType<Doc> & {
		score?: { $meta: 'textScore' };
	};
	/** page/size */
	pagination?: PaginationOptions;
	/** sort by fields of T */
	sort?: SortBy<T>;
	/** optional mongoose session */
	session?: ClientSession;
	/** optional populate */
	populate?: PopulateOptions | PopulateOptions[];
	search?: string;
	// useCursor?: boolean
	// aggPipeline?: PipelineStage[]
}

export const createBaseRepository = <T, Doc extends HydratedDocument<T>>(
	// model: Model<T, {}, Doc>,
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	model: PaginateModel<T, {}, Doc>,
) => ({
	async getAll<F extends FilterQuery<Doc>>(
		opts: MongoQueryOptions<T, Doc>,
	): Promise<PaginateResult<Doc> | Doc[] | []> {
		const {
			filter = {} as F,
			pagination: { page, pageSize } = {},
			projection = {},
			populate,
			sort = {} as SortBy<T>,
			session,
			search,
		} = opts;

		if (search) {
			filter.$text = { $search: search };
			projection.score = { $meta: 'textScore' };
			if (!Array.isArray(sort)) sort.score = { $meta: 'textScore' };
		}

		// ? in case you don't use mongoose paginate v2 and pagination
		if (!page || !pageSize) {
			let query = model.find(filter, projection ?? null, { session });
			// query.skip(page * pageSize).limit(pageSize);

			if (populate) query = query.populate(populate);

			if (sort) {
				if (Array.isArray(sort)) {
					query = query.sort(sort);
				} else {
					query = query.sort(sort as Record<string, SortOrder>);
				}
			}

			const res = (await mongo.fire(() => query)) as CommandResult<
				Doc[] | []
			>;
			return unwrap(res);
		}

		const paginateOptions: PaginateOptions = {
			page,
			limit: pageSize,
			sort: sort || undefined,
			projection,
			populate,
			lean: true,
			options: {
				session,
			},
		};

		const res = (await mongo.fire(
			async () => await model.paginate(filter, paginateOptions),
		)) as CommandResult<PaginateResult<Doc>>;

		return unwrap(res);
	},

	async create(data: unknown, session?: ClientSession): Promise<Doc> {
		const doc = new model(data);
		const res = (await mongo.fire(() =>
			doc.save({ session }),
		)) as CommandResult<Promise<Doc>>;
		return unwrap(res);
	},

	async updateOne(
		filter: FilterQuery<Doc>,
		changes: UpdateQuery<Doc>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return unwrap(
			(await mongo.fire(() =>
				model.updateOne(filter, changes, { session }).lean(),
			)) as CommandResult<Promise<UpdateResult>>,
		);
	},

	async updateMany(
		filter: FilterQuery<Doc>,
		changes: UpdateQuery<Doc>,
		session?: ClientSession,
	): Promise<UpdateResult> {
		return unwrap(
			(await mongo.fire(() =>
				model.updateMany(filter, changes, { session }).lean(),
			)) as CommandResult<Promise<UpdateResult>>,
		);
	},

	async deleteOne(
		filter: FilterQuery<Doc>,
		session?: ClientSession,
	): Promise<DeleteResult> {
		return unwrap(
			(await mongo.fire(() =>
				model.deleteOne(filter, { session }).lean(),
			)) as CommandResult<Promise<DeleteResult>>,
		);
	},

	async isExists(
		filter: FilterQuery<Doc>,
		session?: ClientSession,
	): Promise<ExistsResult> {
		return unwrap(
			(await mongo.fire(() =>
				model
					.exists(filter)
					.session(session as ClientSession)
					.lean(),
			)) as CommandResult<ExistsResult>,
		);
	},

	async countDocuments(
		filter: FilterQuery<Doc>,
		session?: ClientSession,
	): Promise<number> {
		return unwrap(
			(await mongo.fire(() =>
				model.countDocuments(filter, { session }),
			)) as CommandResult<Promise<number>>,
		);
	},
});
