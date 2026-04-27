# Reviews Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Reviews & Ratings module so customers can review products they purchased and winemakers, with per-entity average ratings.

**Architecture:** New Elysia module under `apps/server/src/modules/reviews/` following the routes → service → repository layered pattern used by every other module. Both review tables (`product_reviews`, `winemaker_reviews`) already exist in the DB (migrated in 0000). The only DB-schema work is exporting inferred TypeScript types. Delete endpoints are nested under the parent resource (`DELETE /products/:productId/reviews/:reviewId` and `DELETE /winemakers/:winemakerId/reviews/:reviewId`) so each endpoint always knows which table to hit — no dual-table lookup needed.

**Tech Stack:** Bun, Elysia, Drizzle ORM, PostgreSQL, Zod-via-Elysia `t`, Vitest

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `apps/server/src/db/schema/index.ts` | Export `ProductReview` / `WinemakerReview` inferred types |
| Create | `apps/server/src/modules/reviews/reviews.schema.ts` | Elysia `t` request/response shapes |
| Create | `apps/server/src/modules/reviews/reviews.repository.ts` | All DB queries — no business logic |
| Create | `apps/server/src/modules/reviews/reviews.service.ts` | Business logic: purchaser check, duplicate check, ownership |
| Create | `apps/server/src/modules/reviews/reviews.service.test.ts` | Unit tests with mocked repository |
| Create | `apps/server/src/modules/reviews/reviews.routes.ts` | HTTP route handlers |
| Create | `apps/server/src/modules/reviews/index.ts` | Re-export `reviewsRoutes` |
| Modify | `apps/server/src/app.ts` | Register `reviewsRoutes` + add `reviews` OpenAPI tag |

---

## Task 1: Export review types from schema index

**Files:**
- Modify: `apps/server/src/db/schema/index.ts`

- [ ] **Step 1: Add type imports and exports**

Open `apps/server/src/db/schema/index.ts`. Add to the existing import block at the bottom:

```ts
import type { productReviews, winemakerReviews } from './reviews'
```

Then add to the existing `export type` block:

```ts
export type ProductReview = (typeof productReviews)['$inferSelect']
export type WinemakerReview = (typeof winemakerReviews)['$inferSelect']
```

The final additions sit alongside the existing type exports (`User`, `Wine`, etc.). No other changes.

- [ ] **Step 2: Verify type-check passes**

```bash
cd apps/server && bun run ../../node_modules/.bin/tsc --noEmit
```

Expected: no errors related to reviews types.

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/db/schema/index.ts
git commit -m "feat(WINE-XX): export ProductReview and WinemakerReview types from schema index"
```

---

## Task 2: Write the schema file (Elysia validation types)

**Files:**
- Create: `apps/server/src/modules/reviews/reviews.schema.ts`

- [ ] **Step 1: Create the schema file**

```ts
import { t } from 'elysia'

export const createReviewBody = t.Object({
  rating: t.Integer({ minimum: 1, maximum: 5 }),
  body: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
})

const reviewUserInfo = t.Object({
  id: t.String(),
  fname: t.String(),
  lname: t.String(),
})

export const reviewResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  user: reviewUserInfo,
  rating: t.Integer(),
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
})

export const reviewListResponse = t.Object({
  reviews: t.Array(reviewResponse),
  averageRating: t.Nullable(t.Number()),
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/modules/reviews/reviews.schema.ts
git commit -m "feat(WINE-XX): add reviews schema (request/response Elysia types)"
```

---

## Task 3: Write the repository

**Files:**
- Create: `apps/server/src/modules/reviews/reviews.repository.ts`

- [ ] **Step 1: Create the repository**

```ts
import { and, avg, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { orderItems, orders, productReviews, winemakerReviews } from '../../db/schema'
import type { ProductReview, WinemakerReview } from '../../db/schema'

export type ProductReviewWithUser = ProductReview & {
  user: { id: string; fname: string; lname: string }
}

export type WinemakerReviewWithUser = WinemakerReview & {
  user: { id: string; fname: string; lname: string }
}

export const reviewsRepository = {
  findProductReviews(productId: string): Promise<ProductReviewWithUser[]> {
    return db.query.productReviews.findMany({
      where: and(eq(productReviews.productId, productId), isNull(productReviews.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
    }) as Promise<ProductReviewWithUser[]>
  },

  findWinemakerReviews(winemakerId: string): Promise<WinemakerReviewWithUser[]> {
    return db.query.winemakerReviews.findMany({
      where: and(eq(winemakerReviews.winemakerId, winemakerId), isNull(winemakerReviews.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
    }) as Promise<WinemakerReviewWithUser[]>
  },

  async averageProductRating(productId: string): Promise<number | null> {
    const [row] = await db
      .select({ avg: avg(productReviews.rating) })
      .from(productReviews)
      .where(and(eq(productReviews.productId, productId), isNull(productReviews.deletedAt)))
    return row?.avg !== null && row?.avg !== undefined ? parseFloat(row.avg) : null
  },

  async averageWinemakerRating(winemakerId: string): Promise<number | null> {
    const [row] = await db
      .select({ avg: avg(winemakerReviews.rating) })
      .from(winemakerReviews)
      .where(and(eq(winemakerReviews.winemakerId, winemakerId), isNull(winemakerReviews.deletedAt)))
    return row?.avg !== null && row?.avg !== undefined ? parseFloat(row.avg) : null
  },

  findProductReview(userId: string, productId: string): Promise<ProductReview | undefined> {
    return db.query.productReviews.findFirst({
      where: and(
        eq(productReviews.userId, userId),
        eq(productReviews.productId, productId),
        isNull(productReviews.deletedAt),
      ),
    })
  },

  findWinemakerReview(userId: string, winemakerId: string): Promise<WinemakerReview | undefined> {
    return db.query.winemakerReviews.findFirst({
      where: and(
        eq(winemakerReviews.userId, userId),
        eq(winemakerReviews.winemakerId, winemakerId),
        isNull(winemakerReviews.deletedAt),
      ),
    })
  },

  // Looks up a product review by both its own ID and the product it belongs to.
  // The productId guard prevents cross-resource deletions.
  findProductReviewById(reviewId: string, productId: string): Promise<ProductReview | undefined> {
    return db.query.productReviews.findFirst({
      where: and(
        eq(productReviews.id, reviewId),
        eq(productReviews.productId, productId),
        isNull(productReviews.deletedAt),
      ),
    })
  },

  findWinemakerReviewById(reviewId: string, winemakerId: string): Promise<WinemakerReview | undefined> {
    return db.query.winemakerReviews.findFirst({
      where: and(
        eq(winemakerReviews.id, reviewId),
        eq(winemakerReviews.winemakerId, winemakerId),
        isNull(winemakerReviews.deletedAt),
      ),
    })
  },

  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const rows = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.userId, userId), eq(orderItems.productId, productId)))
      .limit(1)
    return rows.length > 0
  },

  async insertProductReview(
    userId: string,
    productId: string,
    data: { rating: number; body?: string },
  ): Promise<ProductReview> {
    const [review] = await db
      .insert(productReviews)
      .values({ userId, productId, rating: data.rating, body: data.body ?? null })
      .returning()
    if (!review) throw new Error('Product review insert returned no rows')
    return review
  },

  async insertWinemakerReview(
    userId: string,
    winemakerId: string,
    data: { rating: number; body?: string },
  ): Promise<WinemakerReview> {
    const [review] = await db
      .insert(winemakerReviews)
      .values({ userId, winemakerId, rating: data.rating, body: data.body ?? null })
      .returning()
    if (!review) throw new Error('Winemaker review insert returned no rows')
    return review
  },

  async softDeleteProductReview(reviewId: string): Promise<void> {
    await db.update(productReviews).set({ deletedAt: new Date() }).where(eq(productReviews.id, reviewId))
  },

  async softDeleteWinemakerReview(reviewId: string): Promise<void> {
    await db.update(winemakerReviews).set({ deletedAt: new Date() }).where(eq(winemakerReviews.id, reviewId))
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/modules/reviews/reviews.repository.ts
git commit -m "feat(WINE-XX): add reviews repository (all DB queries)"
```

---

## Task 4: Write failing service tests (TDD)

**Files:**
- Create: `apps/server/src/modules/reviews/reviews.service.test.ts`

- [ ] **Step 1: Create the test file with all failing tests**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./reviews.repository', () => ({
  reviewsRepository: {
    findProductReviews: vi.fn(),
    findWinemakerReviews: vi.fn(),
    averageProductRating: vi.fn(),
    averageWinemakerRating: vi.fn(),
    findProductReview: vi.fn(),
    findWinemakerReview: vi.fn(),
    findProductReviewById: vi.fn(),
    findWinemakerReviewById: vi.fn(),
    hasPurchasedProduct: vi.fn(),
    insertProductReview: vi.fn(),
    insertWinemakerReview: vi.fn(),
    softDeleteProductReview: vi.fn(),
    softDeleteWinemakerReview: vi.fn(),
  },
}))

import { reviewsService } from './reviews.service'
import { reviewsRepository } from './reviews.repository'

const userId      = '11111111-1111-1111-1111-111111111111'
const otherUser   = '22222222-2222-2222-2222-222222222222'
const productId   = '33333333-3333-3333-3333-333333333333'
const winemakerId = '44444444-4444-4444-4444-444444444444'
const reviewId    = '55555555-5555-5555-5555-555555555555'

const mockUser = { id: userId, fname: 'Jan', lname: 'Novak' }

const mockProductReview = {
  id: reviewId,
  userId,
  productId,
  rating: 4,
  body: 'Great wine',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  user: mockUser,
}

const mockWinemakerReview = {
  id: reviewId,
  userId,
  winemakerId,
  rating: 5,
  body: null,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  user: mockUser,
}

beforeEach(() => vi.clearAllMocks())

describe('listProductReviews', () => {
  it('returns reviews and averageRating together', async () => {
    vi.mocked(reviewsRepository.findProductReviews).mockResolvedValue([mockProductReview] as never)
    vi.mocked(reviewsRepository.averageProductRating).mockResolvedValue(4.0)

    const result = await reviewsService.listProductReviews(productId)

    expect(result.reviews).toEqual([mockProductReview])
    expect(result.averageRating).toBe(4.0)
    expect(reviewsRepository.findProductReviews).toHaveBeenCalledWith(productId)
    expect(reviewsRepository.averageProductRating).toHaveBeenCalledWith(productId)
  })

  it('returns null averageRating when there are no reviews', async () => {
    vi.mocked(reviewsRepository.findProductReviews).mockResolvedValue([])
    vi.mocked(reviewsRepository.averageProductRating).mockResolvedValue(null)

    const result = await reviewsService.listProductReviews(productId)

    expect(result.reviews).toEqual([])
    expect(result.averageRating).toBeNull()
  })
})

describe('listWinemakerReviews', () => {
  it('returns reviews and averageRating together', async () => {
    vi.mocked(reviewsRepository.findWinemakerReviews).mockResolvedValue([mockWinemakerReview] as never)
    vi.mocked(reviewsRepository.averageWinemakerRating).mockResolvedValue(5.0)

    const result = await reviewsService.listWinemakerReviews(winemakerId)

    expect(result.reviews).toEqual([mockWinemakerReview])
    expect(result.averageRating).toBe(5.0)
  })
})

describe('createProductReview', () => {
  it('creates review for verified purchaser with no prior review', async () => {
    vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true)
    vi.mocked(reviewsRepository.findProductReview).mockResolvedValue(undefined)
    vi.mocked(reviewsRepository.insertProductReview).mockResolvedValue(mockProductReview as never)

    const result = await reviewsService.createProductReview(userId, productId, { rating: 4, body: 'Great wine' })

    expect(result).toEqual(mockProductReview)
    expect(reviewsRepository.insertProductReview).toHaveBeenCalledWith(userId, productId, { rating: 4, body: 'Great wine' })
  })

  it('throws NOT_PURCHASED when user has not ordered the product', async () => {
    vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(false)

    await expect(
      reviewsService.createProductReview(userId, productId, { rating: 4 })
    ).rejects.toThrow('NOT_PURCHASED')

    expect(reviewsRepository.insertProductReview).not.toHaveBeenCalled()
  })

  it('throws DUPLICATE_REVIEW when user already reviewed this product', async () => {
    vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true)
    vi.mocked(reviewsRepository.findProductReview).mockResolvedValue(mockProductReview as never)

    await expect(
      reviewsService.createProductReview(userId, productId, { rating: 4 })
    ).rejects.toThrow('DUPLICATE_REVIEW')

    expect(reviewsRepository.insertProductReview).not.toHaveBeenCalled()
  })
})

describe('createWinemakerReview', () => {
  it('creates review when no prior review exists', async () => {
    vi.mocked(reviewsRepository.findWinemakerReview).mockResolvedValue(undefined)
    vi.mocked(reviewsRepository.insertWinemakerReview).mockResolvedValue(mockWinemakerReview as never)

    const result = await reviewsService.createWinemakerReview(userId, winemakerId, { rating: 5 })

    expect(result).toEqual(mockWinemakerReview)
    expect(reviewsRepository.insertWinemakerReview).toHaveBeenCalledWith(userId, winemakerId, { rating: 5 })
  })

  it('throws DUPLICATE_REVIEW when user already reviewed this winemaker', async () => {
    vi.mocked(reviewsRepository.findWinemakerReview).mockResolvedValue(mockWinemakerReview as never)

    await expect(
      reviewsService.createWinemakerReview(userId, winemakerId, { rating: 5 })
    ).rejects.toThrow('DUPLICATE_REVIEW')

    expect(reviewsRepository.insertWinemakerReview).not.toHaveBeenCalled()
  })
})

describe('deleteProductReview', () => {
  it('allows owner to delete their own product review', async () => {
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(mockProductReview as never)

    await reviewsService.deleteProductReview(reviewId, productId, userId, 'user')

    expect(reviewsRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId)
  })

  it('allows admin to delete any product review regardless of ownership', async () => {
    const otherReview = { ...mockProductReview, userId: otherUser }
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(otherReview as never)

    await reviewsService.deleteProductReview(reviewId, productId, userId, 'admin')

    expect(reviewsRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId)
  })

  it('throws FORBIDDEN when non-owner tries to delete a product review', async () => {
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(mockProductReview as never)

    await expect(
      reviewsService.deleteProductReview(reviewId, productId, otherUser, 'user')
    ).rejects.toThrow('FORBIDDEN')

    expect(reviewsRepository.softDeleteProductReview).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when product review does not exist or belongs to a different product', async () => {
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(undefined)

    await expect(
      reviewsService.deleteProductReview(reviewId, productId, userId, 'user')
    ).rejects.toThrow('NOT_FOUND')
  })
})

describe('deleteWinemakerReview', () => {
  it('allows owner to delete their own winemaker review', async () => {
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(mockWinemakerReview as never)

    await reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, 'user')

    expect(reviewsRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId)
  })

  it('allows admin to delete any winemaker review regardless of ownership', async () => {
    const otherReview = { ...mockWinemakerReview, userId: otherUser }
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(otherReview as never)

    await reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, 'admin')

    expect(reviewsRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId)
  })

  it('throws FORBIDDEN when non-owner tries to delete a winemaker review', async () => {
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(mockWinemakerReview as never)

    await expect(
      reviewsService.deleteWinemakerReview(reviewId, winemakerId, otherUser, 'user')
    ).rejects.toThrow('FORBIDDEN')

    expect(reviewsRepository.softDeleteWinemakerReview).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when winemaker review does not exist or belongs to a different winemaker', async () => {
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(undefined)

    await expect(
      reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, 'user')
    ).rejects.toThrow('NOT_FOUND')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail (service not yet implemented)**

```bash
cd apps/server && bun test src/modules/reviews/reviews.service.test.ts
```

Expected: FAIL with `Cannot find module './reviews.service'`

- [ ] **Step 3: Commit failing tests**

```bash
git add apps/server/src/modules/reviews/reviews.service.test.ts
git commit -m "test(WINE-XX): add failing service tests for reviews module"
```

---

## Task 5: Implement the service (make tests pass)

**Files:**
- Create: `apps/server/src/modules/reviews/reviews.service.ts`

- [ ] **Step 1: Create the service**

```ts
import { reviewsRepository } from './reviews.repository'
import type { ProductReviewWithUser, WinemakerReviewWithUser } from './reviews.repository'

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null }
type ReviewData = { rating: number; body?: string }

export const reviewsService = {
  async listProductReviews(productId: string): Promise<ReviewListResult<ProductReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      reviewsRepository.findProductReviews(productId),
      reviewsRepository.averageProductRating(productId),
    ])
    return { reviews, averageRating }
  },

  async listWinemakerReviews(winemakerId: string): Promise<ReviewListResult<WinemakerReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      reviewsRepository.findWinemakerReviews(winemakerId),
      reviewsRepository.averageWinemakerRating(winemakerId),
    ])
    return { reviews, averageRating }
  },

  async createProductReview(
    userId: string,
    productId: string,
    data: ReviewData,
  ): Promise<ProductReviewWithUser> {
    const purchased = await reviewsRepository.hasPurchasedProduct(userId, productId)
    if (!purchased) throw new Error('NOT_PURCHASED')

    const existing = await reviewsRepository.findProductReview(userId, productId)
    if (existing) throw new Error('DUPLICATE_REVIEW')

    return reviewsRepository.insertProductReview(userId, productId, data) as Promise<ProductReviewWithUser>
  },

  async createWinemakerReview(
    userId: string,
    winemakerId: string,
    data: ReviewData,
  ): Promise<WinemakerReviewWithUser> {
    const existing = await reviewsRepository.findWinemakerReview(userId, winemakerId)
    if (existing) throw new Error('DUPLICATE_REVIEW')

    return reviewsRepository.insertWinemakerReview(userId, winemakerId, data) as Promise<WinemakerReviewWithUser>
  },

  async deleteProductReview(
    reviewId: string,
    productId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const review = await reviewsRepository.findProductReviewById(reviewId, productId)
    if (!review) throw new Error('NOT_FOUND')

    if (userRole !== 'admin' && review.userId !== userId) throw new Error('FORBIDDEN')

    await reviewsRepository.softDeleteProductReview(reviewId)
  },

  async deleteWinemakerReview(
    reviewId: string,
    winemakerId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const review = await reviewsRepository.findWinemakerReviewById(reviewId, winemakerId)
    if (!review) throw new Error('NOT_FOUND')

    if (userRole !== 'admin' && review.userId !== userId) throw new Error('FORBIDDEN')

    await reviewsRepository.softDeleteWinemakerReview(reviewId)
  },
}
```

- [ ] **Step 2: Run tests — verify they all pass**

```bash
cd apps/server && bun test src/modules/reviews/reviews.service.test.ts
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/modules/reviews/reviews.service.ts
git commit -m "feat(WINE-XX): implement reviews service"
```

---

## Task 6: Write the routes

**Files:**
- Create: `apps/server/src/modules/reviews/reviews.routes.ts`

- [ ] **Step 1: Create the routes file**

```ts
import { Elysia, status, t } from 'elysia'
import { authPlugin } from '../auth'
import { reviewsService } from './reviews.service'
import { createReviewBody, reviewListResponse, reviewResponse } from './reviews.schema'

export const reviewsRoutes = new Elysia()
  .use(authPlugin)

  .get(
    '/products/:id/reviews',
    ({ params }) => reviewsService.listProductReviews(params.id),
    {
      params: t.Object({ id: t.String() }),
      response: { 200: reviewListResponse },
      detail: {
        tags: ['reviews'],
        summary: 'List product reviews',
        description: 'Returns all reviews for a product with average rating.',
      },
    },
  )

  .post(
    '/products/:id/reviews',
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await reviewsService.createProductReview(dbUser.id, params.id, body))
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === 'NOT_PURCHASED') return status(403, 'You have not purchased this product')
          if (e.message === 'DUPLICATE_REVIEW') return status(409, 'You have already reviewed this product')
        }
        throw e
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: createReviewBody,
      response: { 201: reviewResponse, 403: t.String(), 409: t.String() },
      detail: {
        tags: ['reviews'],
        summary: 'Create product review',
        description: 'Creates a review for a product. Requires authentication and a completed purchase. One review per user per product.',
        security: [{ bearerAuth: [] }],
      },
    },
  )

  .delete(
    '/products/:productId/reviews/:reviewId',
    async ({ params, dbUser }) => {
      try {
        await reviewsService.deleteProductReview(params.reviewId, params.productId, dbUser.id, dbUser.role)
        return status(204, null)
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === 'NOT_FOUND') return status(404, 'Review not found')
          if (e.message === 'FORBIDDEN') return status(403, 'You do not own this review')
        }
        throw e
      }
    },
    {
      requireAuth: true,
      params: t.Object({ productId: t.String(), reviewId: t.String() }),
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
      detail: {
        tags: ['reviews'],
        summary: 'Delete product review',
        description: 'Soft-deletes a product review. Must be own review or admin.',
        security: [{ bearerAuth: [] }],
      },
    },
  )

  .get(
    '/winemakers/:id/reviews',
    ({ params }) => reviewsService.listWinemakerReviews(params.id),
    {
      params: t.Object({ id: t.String() }),
      response: { 200: reviewListResponse },
      detail: {
        tags: ['reviews'],
        summary: 'List winemaker reviews',
        description: 'Returns all reviews for a winemaker with average rating.',
      },
    },
  )

  .post(
    '/winemakers/:id/reviews',
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await reviewsService.createWinemakerReview(dbUser.id, params.id, body))
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === 'DUPLICATE_REVIEW') return status(409, 'You have already reviewed this winemaker')
        }
        throw e
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: createReviewBody,
      response: { 201: reviewResponse, 409: t.String() },
      detail: {
        tags: ['reviews'],
        summary: 'Create winemaker review',
        description: 'Creates a review for a winemaker. Requires authentication. One review per user per winemaker.',
        security: [{ bearerAuth: [] }],
      },
    },
  )

  .delete(
    '/winemakers/:winemakerId/reviews/:reviewId',
    async ({ params, dbUser }) => {
      try {
        await reviewsService.deleteWinemakerReview(params.reviewId, params.winemakerId, dbUser.id, dbUser.role)
        return status(204, null)
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === 'NOT_FOUND') return status(404, 'Review not found')
          if (e.message === 'FORBIDDEN') return status(403, 'You do not own this review')
        }
        throw e
      }
    },
    {
      requireAuth: true,
      params: t.Object({ winemakerId: t.String(), reviewId: t.String() }),
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
      detail: {
        tags: ['reviews'],
        summary: 'Delete winemaker review',
        description: 'Soft-deletes a winemaker review. Must be own review or admin.',
        security: [{ bearerAuth: [] }],
      },
    },
  )
```

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/modules/reviews/reviews.routes.ts
git commit -m "feat(WINE-XX): add reviews routes (6 endpoints)"
```

---

## Task 7: Wire up index + register in app

**Files:**
- Create: `apps/server/src/modules/reviews/index.ts`
- Modify: `apps/server/src/app.ts`

- [ ] **Step 1: Create index.ts**

```ts
export { reviewsRoutes } from './reviews.routes'
```

- [ ] **Step 2: Register in app.ts**

In `apps/server/src/app.ts`, add the import:

```ts
import { reviewsRoutes } from './modules/reviews'
```

Add the OpenAPI tag to the `tags` array (inside the `openapi(...)` call, alongside the existing tags):

```ts
{ name: 'reviews', description: 'Product and winemaker reviews & ratings' },
```

Add `.use(reviewsRoutes)` to the chain, after `.use(winemakersRoutes)`:

```ts
  .use(reviewsRoutes)
```

- [ ] **Step 3: Run type-check**

```bash
cd apps/server && bun run ../../node_modules/.bin/tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run all tests to confirm no regressions**

```bash
cd apps/server && bun test
```

Expected: all existing tests pass, new reviews tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/modules/reviews/index.ts apps/server/src/app.ts
git commit -m "feat(WINE-XX): register reviews module in app and wire up OpenAPI tag"
```

---

## Task 8: Final verification

- [ ] **Step 1: Start the server and confirm Scalar shows reviews endpoints**

```bash
cd apps/server && bun run dev
```

Open `http://localhost:3000/swagger` in a browser. Confirm the `reviews` tag appears with 6 endpoints:
- `GET /products/{id}/reviews`
- `POST /products/{id}/reviews`
- `DELETE /products/{productId}/reviews/{reviewId}`
- `GET /winemakers/{id}/reviews`
- `POST /winemakers/{id}/reviews`
- `DELETE /winemakers/{winemakerId}/reviews/{reviewId}`

- [ ] **Step 2: Run the full test suite one final time**

```bash
cd apps/server && bun test
```

Expected: all tests pass.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(WINE-XX): complete reviews & ratings module (6 endpoints, purchaser verification, 409 on duplicate)"
```

---

## Spec Coverage Verification

| Requirement | Covered by |
|---|---|
| `GET /products/:id/reviews` | Task 6 route |
| `POST /products/:id/reviews` | Task 6 route |
| `GET /winemakers/:id/reviews` | Task 6 route |
| `POST /winemakers/:id/reviews` | Task 6 route |
| `DELETE /products/:productId/reviews/:reviewId` | Task 6 route |
| `DELETE /winemakers/:winemakerId/reviews/:reviewId` | Task 6 route |
| Verified purchaser only for product reviews | Task 5 service (`NOT_PURCHASED` check) |
| One review per customer per product | Task 5 service (`DUPLICATE_REVIEW` check) |
| Duplicate attempt returns 409 | Task 6 route handler |
| Ratings 1–5 stars | Task 2 schema (`t.Integer({ minimum: 1, maximum: 5 })`) |
| Optional text | Task 2 schema (`t.Optional(t.String(...))`) |
| Average rating on list response | Task 3 repository (`avg()`) + Task 5 service + Task 2 schema |
| Own review or admin can delete | Task 5 service (`deleteProductReview` / `deleteWinemakerReview`) |
| Delete scoped to correct parent (no cross-resource deletion) | Task 3 repository (`findProductReviewById` checks both `id` AND `productId`) |
| OpenAPI spec updated | Task 7 (tag registered, all routes have `detail`) |
| DB tables already exist | Confirmed in migration `0000_lean_captain_cross.sql` — no migration needed |
