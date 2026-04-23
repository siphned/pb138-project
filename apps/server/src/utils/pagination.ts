export function parsePagination(query: { page?: number; limit?: number }) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? 20))
  return { limit, offset: (page - 1) * limit }
}

export type PaginatedResult<T> = {
  data: T[]
  page: number
  limit: number
  total: number
}
