export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
  errors?: unknown;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  /** Older endpoints send `pages`, newer ones `totalPages`; the API client fills in both. */
  pages: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedData<T> {
  pagination: Pagination;
}