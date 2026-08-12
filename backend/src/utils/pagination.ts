// Pagination lives in one place so every list endpoint behaves identically:
// same query params (?page, ?limit), same defaults and caps, same envelope.

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100; // hard ceiling so a client can't ask for 10,000 rows.

export interface Pagination {
  skip: number; // rows to skip — what Prisma's `skip` wants.
  take: number; // rows to return — what Prisma's `take` wants.
  page: number; // 1-based page, echoed back to the client.
  limit: number; // page size, echoed back to the client.
}

export interface PaginatedResponse<T> {
  // angle brackets are typescript generics. <T> declares a type parameter - a placeholder for a type the caller fills in later.
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Turn raw query params into safe skip/take. Anything missing or unparseable
// falls back to the defaults; limit is clamped to [1, MAX_LIMIT], page to >= 1.
export function parsePagination(query: unknown): Pagination {
  const q = (query ?? {}) as Record<string, unknown>;
  const page = Math.max(1, parseInt(String(q.page ?? ""), 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(q.limit ?? ""), 10) || DEFAULT_LIMIT),
  );
  // Yes, `take` and `limit` are always equal here. It's **not strictly necessary**
  // — you could drop `take` and pass `limit` to Prisma directly. It's a deliberate **readability/intent** choice
  return { skip: (page - 1) * limit, take: limit, page, limit };
}
// Wrap a page of items + the total count into the standard list envelope.
export function paginated<T>(
  items: T[],
  total: number,
  { page, limit }: Pick<Pagination, "page" | "limit">,
): PaginatedResponse<T> {
  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
