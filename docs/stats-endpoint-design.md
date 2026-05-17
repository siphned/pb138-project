# Stats Endpoint Design

**Date:** 2026-05-16  
**Branch:** WINE-195-backend-api-gaps-consolidation-wine-171-audit  
**Author:** Ondrej Malek

---

## Overview

Add a single `GET /stats?role=<role>` endpoint that returns aggregate statistics for the authenticated caller, shaped by their role. No new packages required — Elysia 1.4 + Zod v4 both implement Standard Schema, so Zod schemas pass directly into Elysia validators.

---

## Endpoint Contract

```
GET /stats?role=customer|winemaker|shop_owner|admin
Authorization: Bearer <token>   (required)
```

### Auth rules

| `?role=` | Caller must hold |
|---|---|
| `customer` | any authenticated user |
| `winemaker` | `winemaker` in `clerkPayload.roles` |
| `shop_owner` | `shop_owner` in `clerkPayload.roles` |
| `admin` | `admin` in `clerkPayload.roles` |

Returns `403 ForbiddenError` if the caller does not hold the requested role.

### Responses

- `200` — role-specific stats object (discriminated union, see schemas below)
- `403` — `errorResponse` (existing TypeBox shape)

---

## Module Structure

New module: `apps/server/src/modules/stats/`

```
stats.schema.ts     ← Zod schemas + exported TS types
stats.repository.ts ← 4 aggregate query functions (one per role)
stats.service.ts    ← dispatches to repo, Zod-parses result before returning
stats.routes.ts     ← GET /stats?role=..., auth + role check
index.ts            ← re-exports statsRoutes
```

Registered in `app.ts`. New OpenAPI tag `"stats"`.

---

## Response Schemas (`stats.schema.ts`)

All numeric money/stock fields are `number` (parsed from Postgres `numeric` string via `parseFloat`). Each schema includes a `role` literal as the discriminant.

### Customer

```ts
z.object({
  role: z.literal("customer"),
  ordersCount: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  eventsAttended: z.number().int().nonnegative(),
  reviewsWritten: z.number().int().nonnegative(),
})
```

Sources:
- `ordersCount` — `COUNT(*) FROM orders WHERE userId = me AND deletedAt IS NULL AND status != 'cancelled'`
- `totalSpent` — `SUM(totalPrice) FROM orders WHERE userId = me AND deletedAt IS NULL AND status != 'cancelled'`
- `eventsAttended` — `COUNT(*) FROM eventRegistrations WHERE userId = me AND deletedAt IS NULL`
- `reviewsWritten` — `COUNT(*) FROM reviews WHERE userId = me AND deletedAt IS NULL`

### Winemaker

```ts
z.object({
  role: z.literal("winemaker"),
  wineCount: z.number().int().nonnegative(),
  totalStock: z.number().int().nonnegative(),
  eventsByStatus: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  supplyAgreementsByStatus: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  avgReviewScore: z.number().nonnegative().nullable(),
})
```

Sources (all scoped to `winemakers.userId = me → winemakerId`):
- `wineCount` — `COUNT(*) FROM wines WHERE winemakerId = ? AND deletedAt IS NULL`
- `totalStock` — `SUM(quantity) FROM wines WHERE winemakerId = ? AND deletedAt IS NULL`
- `eventsByStatus` — `SELECT status, COUNT(*) FROM events WHERE winemakerId = ? AND deletedAt IS NULL GROUP BY status`
- `supplyAgreementsByStatus` — `SELECT status, COUNT(*) FROM supplyAgreements WHERE winemakerId = ? AND deletedAt IS NULL GROUP BY status`
- `avgReviewScore` — `AVG(rating) FROM reviews WHERE entityId = winemakerId AND entityType = 'winemaker' AND deletedAt IS NULL` (null when no reviews)

### Shop Owner

```ts
z.object({
  role: z.literal("shop_owner"),
  shopsCount: z.number().int().nonnegative(),
  productsByType: z.object({
    standard: z.number().int().nonnegative(),
    bundles: z.number().int().nonnegative(),
  }),
  totalStockValue: z.number().nonnegative(),
  orderItemsProcessed: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  supplyAgreementsByStatus: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
})
```

Sources (all scoped to `shops WHERE ownerUserId = me → shopIds`):
- `shopsCount` — `COUNT(*) FROM shops WHERE ownerUserId = me AND deletedAt IS NULL`
- `productsByType` — `SELECT isBundle, COUNT(*) FROM products WHERE shopId IN (shopIds) AND deletedAt IS NULL GROUP BY isBundle`
- `totalStockValue` — `SUM(price * quantity) FROM products WHERE shopId IN (shopIds) AND deletedAt IS NULL`
- `orderItemsProcessed` — `COUNT(*) FROM orderItems WHERE shopId IN (shopIds) AND deletedAt IS NULL`
- `revenue` — `SUM(oi.unitPriceAtPurchase * oi.quantity) FROM orderItems oi JOIN orders o ON oi.orderId = o.id WHERE oi.shopId IN (shopIds) AND o.status IN ('confirmed','shipped','delivered') AND oi.deletedAt IS NULL`
- `supplyAgreementsByStatus` — `SELECT status, COUNT(*) FROM supplyAgreements WHERE shopId IN (shopIds) AND deletedAt IS NULL GROUP BY status`

### Admin

```ts
z.object({
  role: z.literal("admin"),
  usersByRole: z.object({
    customer: z.number().int().nonnegative(),
    winemaker: z.number().int().nonnegative(),
    shop_owner: z.number().int().nonnegative(),
    admin: z.number().int().nonnegative(),
  }),
  totalRevenue: z.number().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  totalShops: z.number().int().nonnegative(),
  totalWinemakers: z.number().int().nonnegative(),
  totalEvents: z.number().int().nonnegative(),
  pendingRoleRequests: z.number().int().nonnegative(),
  pendingEvents: z.number().int().nonnegative(),
  deletedReviews: z.number().int().nonnegative(),
})
```

Sources:
- `usersByRole` — `SELECT role, COUNT(*) FROM userRoles WHERE deletedAt IS NULL GROUP BY role`
- `totalRevenue` — `SUM(totalPrice) FROM orders WHERE status IN ('confirmed','shipped','delivered') AND deletedAt IS NULL`
- `totalProducts` — `COUNT(*) FROM products WHERE deletedAt IS NULL`
- `totalShops` — `COUNT(*) FROM shops WHERE deletedAt IS NULL`
- `totalWinemakers` — `COUNT(*) FROM winemakers WHERE deletedAt IS NULL`
- `totalEvents` — `COUNT(*) FROM events WHERE deletedAt IS NULL`
- `pendingRoleRequests` — `COUNT(*) FROM roleRequests WHERE status = 'pending' AND deletedAt IS NULL`
- `pendingEvents` — `COUNT(*) FROM events WHERE status = 'pending' AND deletedAt IS NULL`
- `deletedReviews` — `COUNT(*) FROM reviews WHERE deletedAt IS NOT NULL` (soft-deleted by admin)

### Discriminated union

```ts
export const statsResponseSchema = z.discriminatedUnion("role", [
  customerStatsSchema,
  winemakerStatsSchema,
  shopOwnerStatsSchema,
  adminStatsSchema,
]);
export type StatsResponse = z.infer<typeof statsResponseSchema>;
```

---

## Service Layer (`stats.service.ts`)

```
getStats(userId: string, role: string, callerRoles: string[]): Promise<StatsResponse>
```

1. Validate caller holds the requested role (throw `ForbiddenError` if not).
2. Dispatch to the matching repo function.
3. `statsResponseSchema.parse(result)` before returning — catches any repo bugs at runtime.

---

## Repository Layer (`stats.repository.ts`)

Four functions, each takes `db: Database` and a scoping ID:

| Function | Scope param |
|---|---|
| `getCustomerStats(db, userId)` | `userId` |
| `getWinemakerStats(db, winemakerId)` | `winemakerId` (resolved from `userId` in service) |
| `getShopOwnerStats(db, ownerUserId)` | `ownerUserId` |
| `getAdminStats(db)` | none |

All queries run as `Promise.all([...])` within each function to minimise round-trips. Counts from Drizzle's `count()` helper are cast to `Number()`. Sums from `sum()` are cast via `parseFloat(...) || 0`.

---

## Error Handling

| Scenario | Error |
|---|---|
| Unauthenticated | `401` (authPlugin) |
| Role mismatch | `403 ForbiddenError` |
| Winemaker profile not found for caller | `404 NotFoundError` |
| Invalid `?role=` value | `422` (Elysia query validation) |

---

## OpenAPI

New tag added to `app.ts`:
```ts
{ name: "stats", description: "Role-scoped aggregate statistics" }
```

Elysia generates `oneOf` from the discriminated union via Standard Schema.

---

## Out of Scope

- Visitor/page-view counts (requires separate analytics infra)
- Time-range filtering (future iteration)
- Caching / materialised views (can be added later if queries are slow)