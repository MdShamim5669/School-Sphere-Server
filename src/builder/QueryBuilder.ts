import { IPaginationOptions } from "../interface/error.js";

export class QueryBuilder<TWhereInput = Record<string, any>> {
  public query: Record<string, any>;
  public andConditions: Record<string, any>[];
  public pagination: {
    page: number;
    limit: number;
    skip: number;
    take: number;
  };
  public orderBy: Record<string, "asc" | "desc">;

  constructor(
    query: Record<string, any> = {},
    options: IPaginationOptions = {}
  ) {
    this.query = { ...query };
    this.andConditions = [];

    const page = Math.max(1, Number(options.page || query.page || 1));
    const limit = Math.max(1, Number(options.limit || query.limit || 10));
    const skip = (page - 1) * limit;
    const take = limit;
    this.pagination = { page, limit, skip, take };

    const sortBy = options.sortBy || query.sortBy || "createdAt";
    const sortOrder =
      (options.sortOrder || query.sortOrder || "desc").toLowerCase() === "asc"
        ? "asc"
        : "desc";
    this.orderBy = { [sortBy]: sortOrder };
  }

  /**
   * Builds case-insensitive partial search over specified string fields
   */
  public search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;
    if (
      searchTerm &&
      typeof searchTerm === "string" &&
      searchableFields.length > 0
    ) {
      this.andConditions.push({
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      });
    }
    return this;
  }

  /**
   * Filters by exact match while excluding control/pagination/search fields
   */
  public filter(excludeFields: string[] = []): this {
    const defaultExcludes = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      ...excludeFields,
    ];

    const filterObj: Record<string, any> = {};
    for (const key of Object.keys(this.query)) {
      if (
        !defaultExcludes.includes(key) &&
        this.query[key] !== undefined &&
        this.query[key] !== ""
      ) {
        filterObj[key] = this.query[key];
      }
    }

    if (Object.keys(filterObj).length > 0) {
      this.andConditions.push({
        AND: Object.keys(filterObj).map((key) => ({
          [key]: {
            equals: filterObj[key],
          },
        })),
      });
    }

    return this;
  }

  /**
   * Manually adds custom where conditions (e.g. relational queries, scope filters)
   */
  public rawWhere(condition: Record<string, any> | undefined | null): this {
    if (condition && Object.keys(condition).length > 0) {
      this.andConditions.push(condition);
    }
    return this;
  }

  /**
   * Custom dynamic sort configuration
   */
  public sort(
    defaultSortBy = "createdAt",
    defaultSortOrder: "asc" | "desc" = "desc"
  ): this {
    const sortBy = this.query.sortBy || defaultSortBy;
    const sortOrder =
      (this.query.sortOrder || defaultSortOrder).toLowerCase() === "asc"
        ? "asc"
        : "desc";
    this.orderBy = { [sortBy]: sortOrder };
    return this;
  }

  /**
   * Custom pagination configuration
   */
  public paginate(defaultPage = 1, defaultLimit = 10): this {
    const page = Math.max(1, Number(this.query.page || defaultPage));
    const limit = Math.max(1, Number(this.query.limit || defaultLimit));
    const skip = (page - 1) * limit;
    const take = limit;
    this.pagination = { page, limit, skip, take };
    return this;
  }

  /**
   * Returns consolidated where condition for Prisma
   */
  public getWhere(): TWhereInput {
    if (this.andConditions.length === 0) {
      return {} as TWhereInput;
    }
    return { AND: this.andConditions } as unknown as TWhereInput;
  }

  /**
   * Returns complete Prisma query options: { where, skip, take, orderBy }
   */
  public build() {
    return {
      where: this.getWhere(),
      skip: this.pagination.skip,
      take: this.pagination.take,
      orderBy: this.orderBy,
    };
  }

  /**
   * Returns standardized meta payload
   */
  public getMeta(total: number) {
    return {
      page: this.pagination.page,
      limit: this.pagination.limit,
      total,
    };
  }
}

export default QueryBuilder;
