export interface IQueryParams {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  fields?: string;
  include?: string;
  [key: string]: unknown;
}

export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
  numberFields?: string[];
  dateFields?: string[];
  booleanFields?: string[];
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface IQueryResult<T> {
  meta: IPaginationMeta;
  data: T[];
}

export interface PrismaModelDelegate<T = any> {
  findMany(args?: any): Promise<T[]>;
  count(args?: any): Promise<number>;
}

export interface PrismaStringFilter {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  equals?: string;
  mode?: "default" | "insensitive";
  not?: string | PrismaStringFilter;
  in?: string[];
  notIn?: string[];
}

export interface PrismaNumberFilter {
  equals?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: number;
  in?: number[];
  notIn?: number[];
}

export interface PrismaDateFilter {
  equals?: Date;
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
  not?: Date;
}
