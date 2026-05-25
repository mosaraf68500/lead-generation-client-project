/**
 * Reusable Mongoose query builder. Provides chainable `search`, `filter`,
 * `sort`, `paginate` and a final `exec` that also returns pagination meta.
 *
 * It's intentionally small: it handles the 80% common case without trying
 * to be a full ODM. Module services can always bypass it for complex
 * aggregations.
 */
import type { FilterQuery, Query } from 'mongoose';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  // Index signature so a `PaginationMeta` value can flow into `sendResponse`'s
  // `ResponseMeta` slot (which already declares `[key: string]: unknown`).
  [key: string]: unknown;
}

export interface BuildResult<T> {
  data: T[];
  meta: PaginationMeta;
}

type QueryRecord = Record<string, unknown>;

export class QueryBuilder<T> {
  private query: Query<T[], T>;
  private readonly queryParams: QueryRecord;

  constructor(query: Query<T[], T>, queryParams: QueryRecord = {}) {
    this.query = query;
    this.queryParams = queryParams;
  }

  /** Case-insensitive `$or` search across the given fields. */
  search(searchableFields: string[]): this {
    const term = (this.queryParams.search as string | undefined)?.trim();
    if (!term) return this;
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const $or = searchableFields.map((field) => ({
      [field]: { $regex: safe, $options: 'i' },
    })) as FilterQuery<T>[];
    this.query = this.query.find({ $or } as FilterQuery<T>);
    return this;
  }

  /** Apply equality filters for any query param not reserved for paging/sorting. */
  filter(allowed: string[] = []): this {
    const reserved = new Set(['search', 'sort', 'page', 'limit', 'fields']);
    const filters: QueryRecord = {};
    for (const [key, value] of Object.entries(this.queryParams)) {
      if (reserved.has(key)) continue;
      if (allowed.length > 0 && !allowed.includes(key)) continue;
      if (value === undefined || value === '') continue;
      filters[key] = value;
    }
    if (Object.keys(filters).length > 0) {
      this.query = this.query.find(filters as FilterQuery<T>);
    }
    return this;
  }

  /** Accepts comma-separated `sort` like `-createdAt,title`. */
  sort(defaultSort = '-createdAt'): this {
    const sortBy = (this.queryParams.sort as string | undefined)?.split(',').join(' ') ?? defaultSort;
    this.query = this.query.sort(sortBy);
    return this;
  }

  /** Project specific fields via `?fields=a,b,c`. */
  selectFields(): this {
    const fields = (this.queryParams.fields as string | undefined)?.split(',').join(' ');
    if (fields) this.query = this.query.select(fields);
    return this;
  }

  paginate(): this {
    const page = Math.max(1, Number(this.queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.queryParams.limit) || 10));
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Executes the query AND a parallel count for pagination meta. The count
   * uses the same model + the merged filter the query has accumulated.
   */
  async exec(): Promise<BuildResult<T>> {
    const page = Math.max(1, Number(this.queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.queryParams.limit) || 10));

    const filter = this.query.getFilter();
    const [data, total] = await Promise.all([
      this.query.exec(),
      this.query.model.countDocuments(filter as FilterQuery<T>),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
