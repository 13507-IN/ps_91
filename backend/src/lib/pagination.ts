import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

// ============================================================
// Pagination Helpers
// ============================================================

/** Zod schema for pagination query params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Calculate skip/take for Prisma from page/limit */
export function paginateQuery(input: PaginationInput): { skip: number; take: number } {
  return {
    skip: (input.page - 1) * input.limit,
    take: input.limit,
  };
}

/** Build a paginated response object */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  input: PaginationInput,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / input.limit);
  return {
    data,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
      hasNext: input.page < totalPages,
      hasPrev: input.page > 1,
    },
  };
}
