export interface TResponse<T> {
  data: T;
  message: string;
  path: string;
  status: boolean;
  statusCode: number;
  timestamp: string;
}
export interface TPaginatedResponse<T> {
  data: T;
  meta: {
    total: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}
