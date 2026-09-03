import { IPaginationOptions } from "../interface/error.js";
import {
  IQueryConfig,
  IPaginationMeta,
  IQueryParams,
  IQueryResult,
  PrismaDateFilter,
  PrismaModelDelegate,
  PrismaNumberFilter,
  PrismaStringFilter,
} from "../interface/query.interface.js";

/**
 * Universal QueryBuilder for School Sphere:
 * Supports:
 * 1. Modern delegate mode: new QueryBuilder(prisma.model, query, config).search().filter().sort().paginate().execute()
 * 2. Legacy options mode: new QueryBuilder(filters, options).search(fields).filter(excludes).build()
 */
export class QueryBuilder<
  T = any,
  TWhereInput = Record<string, any>,
  TInclude = Record<string, any>
> {
  // Common state
  public query: Record<string, any>;
  public andConditions: Record<string, any>[] = [];
  public pagination: {
    page: number;
    limit: number;
    skip: number;
    take: number;
  };
  public orderBy: Record<string, "asc" | "desc">;

  // Modern delegate mode state
  private model?: PrismaModelDelegate<T>;
  private config: IQueryConfig;
  private selectFields?: Record<string, boolean>;
  private includes?: Record<string, any>;
  private searchConditions: Record<string, any>[] = [];
  private filterConditions: Record<string, any> = {};
  private customConditions: Record<string, any>[] = [];

  constructor(
    arg1: PrismaModelDelegate<T> | Record<string, any> = {},
    arg2: IQueryParams | IPaginationOptions = {},
    arg3: IQueryConfig = {}
  ) {
    const isDelegate =
      arg1 &&
      typeof arg1 === "object" &&
      typeof (arg1 as any).findMany === "function" &&
      typeof (arg1 as any).count === "function";

    if (isDelegate) {
      this.model = arg1 as PrismaModelDelegate<T>;
      this.query = (arg2 as Record<string, any>) || {};
      this.config = arg3 || {};
    } else {
      this.query = { ...(arg1 as Record<string, any>) };
      this.config = {};
    }

    const rawOptions = (isDelegate ? arg2 : arg2) as Record<string, any>;
    const page = Math.max(1, Number(rawOptions?.page || this.query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(rawOptions?.limit || this.query.limit || 10)));
    const skip = (page - 1) * limit;
    const take = limit;
    this.pagination = { page, limit, skip, take };

    const sortBy = (rawOptions?.sortBy || this.query.sortBy || "createdAt") as string;
    const rawSortOrder = (rawOptions?.sortOrder || this.query.sortOrder || "desc") as string;
    const sortOrder: "asc" | "desc" = rawSortOrder.toLowerCase() === "asc" ? "asc" : "desc";
    this.orderBy = { [sortBy]: sortOrder };
  }

  // ==========================================
  // Modern & Legacy Search
  // ==========================================
  public search(searchableFields?: string[]): this {
    const fieldsToSearch = searchableFields || this.config.searchableFields;
    const searchTerm = (this.query.searchTerm as string)?.trim();

    if (searchTerm && fieldsToSearch && fieldsToSearch.length > 0) {
      const conditions = fieldsToSearch.map((field) => {
        const stringFilter: PrismaStringFilter = {
          contains: searchTerm,
          mode: "insensitive",
        };

        if (field.includes(".")) {
          return this.buildNestedFieldCondition(field.split("."), stringFilter);
        }
        return { [field]: stringFilter };
      });

      this.searchConditions = conditions;
      this.andConditions.push({ OR: conditions });
    }

    return this;
  }

  // ==========================================
  // Modern & Legacy Filter
  // ==========================================
  public filter(excludeFields: string[] = []): this {
    const defaultExcludes = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include",
      ...excludeFields,
    ];

    const filterObj: Record<string, any> = {};
    for (const key of Object.keys(this.query)) {
      if (
        !defaultExcludes.includes(key) &&
        this.query[key] !== undefined &&
        this.query[key] !== null &&
        this.query[key] !== ""
      ) {
        if (
          !this.config.filterableFields ||
          this.config.filterableFields.length === 0 ||
          this.config.filterableFields.includes(key)
        ) {
          filterObj[key] = this.query[key];
        }
      }
    }

    Object.keys(filterObj).forEach((key) => {
      const value = filterObj[key];

      if (typeof value === "object" && !Array.isArray(value)) {
        const parsedRange = this.parseRangeFilter(key, value);
        if (key.includes(".")) {
          this.setNestedValue(this.filterConditions, key.split("."), parsedRange);
        } else {
          this.filterConditions[key] = parsedRange;
        }
        return;
      }

      const parsedValue = this.parseFilterValue(key, value);
      if (key.includes(".")) {
        this.setNestedValue(this.filterConditions, key.split("."), parsedValue);
      } else {
        this.filterConditions[key] = parsedValue;
      }
    });

    if (Object.keys(this.filterConditions).length > 0) {
      this.andConditions.push(this.filterConditions);
    }

    return this;
  }

  // ==========================================
  // Custom Where
  // ==========================================
  public rawWhere(condition: Record<string, any> | undefined | null): this {
    if (condition && Object.keys(condition).length > 0) {
      this.andConditions.push(condition);
      this.customConditions.push(condition);
    }
    return this;
  }

  public where(condition: TWhereInput): this {
    return this.rawWhere(condition as Record<string, any>);
  }

  // ==========================================
  // Sort & Pagination
  // ==========================================
  public sort(
    defaultSortBy = "createdAt",
    defaultSortOrder: "asc" | "desc" = "desc"
  ): this {
    const sortBy = (this.query.sortBy as string) || defaultSortBy;
    const sortOrder =
      ((this.query.sortOrder as string) || defaultSortOrder).toLowerCase() === "asc"
        ? "asc"
        : "desc";

    if (sortBy.includes(".")) {
      this.orderBy = this.buildNestedSort(sortBy.split("."), sortOrder) as any;
    } else {
      this.orderBy = { [sortBy]: sortOrder };
    }
    return this;
  }

  public paginate(defaultPage = 1, defaultLimit = 10): this {
    const page = Math.max(1, Number(this.query.page || defaultPage));
    const limit = Math.max(1, Math.min(100, Number(this.query.limit || defaultLimit)));
    const skip = (page - 1) * limit;
    const take = limit;
    this.pagination = { page, limit, skip, take };
    return this;
  }

  // ==========================================
  // Fields & Includes
  // ==========================================
  public fields(): this {
    const fieldsParam = this.query.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam.split(",").map((f) => f.trim());
      this.selectFields = {};
      fieldsArray.forEach((field) => {
        if (field) this.selectFields![field] = true;
      });
      this.includes = undefined;
    }
    return this;
  }

  public include(relation: TInclude): this {
    if (this.selectFields) return this;
    this.includes = { ...(this.includes || {}), ...(relation as Record<string, any>) };
    return this;
  }

  public dynamicInclude(
    includeConfig: Record<string, any>,
    defaultInclude?: string[]
  ): this {
    if (this.selectFields) return this;
    const result: Record<string, any> = {};

    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) result[field] = includeConfig[field];
    });

    const includeParam = this.query.include;
    if (includeParam && typeof includeParam === "string") {
      const requested = includeParam.split(",").map((r) => r.trim());
      requested.forEach((rel) => {
        if (includeConfig[rel]) result[rel] = includeConfig[rel];
      });
    }

    if (Object.keys(result).length > 0) {
      this.includes = { ...(this.includes || {}), ...result };
    }
    return this;
  }

  // ==========================================
  // Prisma Query Getters & Execution
  // ==========================================
  public getWhere(): TWhereInput {
    if (this.andConditions.length === 0) {
      return {} as TWhereInput;
    }
    return { AND: this.andConditions } as unknown as TWhereInput;
  }

  public build() {
    const res: Record<string, any> = {
      where: this.getWhere(),
      skip: this.pagination.skip,
      take: this.pagination.take,
      orderBy: this.orderBy,
    };

    if (this.selectFields && Object.keys(this.selectFields).length > 0) {
      res.select = this.selectFields;
    } else if (this.includes && Object.keys(this.includes).length > 0) {
      res.include = this.includes;
    }

    return res;
  }

  public getMeta(total: number): IPaginationMeta {
    const totalPages = Math.ceil(total / this.pagination.limit) || 1;
    return {
      page: this.pagination.page,
      limit: this.pagination.limit,
      total,
      totalPages,
    };
  }

  public async execute(): Promise<IQueryResult<T>> {
    if (!this.model) {
      throw new Error("QueryBuilder model delegate is required for .execute()");
    }

    const queryArgs = this.build();
    const countWhere = queryArgs.where;

    const [total, data] = await Promise.all([
      this.model.count({ where: countWhere }),
      this.model.findMany(queryArgs),
    ]);

    return {
      data: data as T[],
      meta: this.getMeta(total),
    };
  }

  public async count(): Promise<number> {
    if (!this.model) {
      throw new Error("QueryBuilder model delegate is required for .count()");
    }
    return await this.model.count({ where: this.getWhere() });
  }

  // ==========================================
  // Private Helpers
  // ==========================================
  private buildNestedFieldCondition(
    parts: string[],
    filter: PrismaStringFilter
  ): Record<string, any> {
    if (parts.length === 1) return { [parts[0]]: filter };
    const [current, ...rest] = parts;
    return {
      [current]: this.buildNestedFieldCondition(rest, filter),
    };
  }

  private setNestedValue(
    target: Record<string, any>,
    parts: string[],
    value: any
  ): void {
    let current = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  private buildNestedSort(
    parts: string[],
    direction: "asc" | "desc"
  ): Record<string, any> {
    if (parts.length === 1) return { [parts[0]]: direction };
    const [current, ...rest] = parts;
    return {
      [current]: this.buildNestedSort(rest, direction),
    };
  }

  private parseFilterValue(key: string, value: unknown): unknown {
    if (value === "true") return true;
    if (value === "false") return false;

    if (this.config.booleanFields?.includes(key)) {
      return value === "true" || value === true;
    }

    if (this.config.dateFields?.includes(key) && typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }

    const isExplicitNumber = this.config.numberFields?.includes(key);
    if (
      isExplicitNumber &&
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value.trim() !== ""
    ) {
      return Number(value);
    }

    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(key, item)) };
    }

    return value;
  }

  private parseRangeFilter(
    key: string,
    value: Record<string, any>
  ): PrismaNumberFilter | PrismaDateFilter | Record<string, any> {
    const rangeQuery: Record<string, any> = {};
    const isDateField =
      this.config.dateFields?.includes(key) ||
      key.toLowerCase().includes("date") ||
      key.toLowerCase().includes("time") ||
      key.toLowerCase().includes("at");

    Object.keys(value).forEach((operator) => {
      const opValue = value[operator];
      let parsedValue: any = opValue;

      if (isDateField && typeof opValue === "string") {
        const d = new Date(opValue);
        if (!isNaN(d.getTime())) parsedValue = d;
      } else if (typeof opValue === "string" && !isNaN(Number(opValue)) && opValue.trim() !== "") {
        parsedValue = Number(opValue);
      }

      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          rangeQuery[operator] = Array.isArray(opValue)
            ? opValue.map((v) => (typeof v === "string" && !isNaN(Number(v)) ? Number(v) : v))
            : [parsedValue];
          break;
      }
    });

    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
}

export default QueryBuilder;
