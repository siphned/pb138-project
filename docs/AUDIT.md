# 🔥 CODEBASE AUDIT — WINERY PLATFORM
**Date:** 2026-04-30  
**Auditor:** Senior Dev Mentor (Adversarial Review)  
**Scope:** Full stack — Backend, Frontend, Shared packages, Config

---

## EXECUTIVE SUMMARY

This codebase is a **typical student project that thinks it's production-ready**. While the monorepo structure and tech stack show promise, the implementation is riddled with inconsistencies, security holes, and copy-paste architecture that will burn you in production. You've built a house on sand.

**Grade: C-** (Would not deploy to production without major refactoring)

---

## 🚨 CRITICAL SECURITY ISSUES

### 1. Authentication Plugin — Copy-Paste Disaster
**File:** `apps/server/src/modules/auth/auth.plugin.ts:9-78`

The three macros (`requireAuth`, `requireCapability`, `requireRoles`) are **95% identical copy-pasted code**. Each one:
- Verifies Clerk token
- Calls `usersService.lazyGetOrCreate`
- Merges guest cart
- Returns same payload

**Why this is catastrophic:** If you need to change auth logic (add logging, change error responses, add rate limiting), you must remember to update THREE places. Spoiler: you'll forget.

**Fix:** Extract a `authenticateRequest()` helper and call it from all macros.

```typescript
// Current: 70 lines of duplicated garbage
// Should be: 20 lines with shared helper
```

### 2. Error Details Leaked in Production
**File:** `apps/server/src/app.ts:32`

```typescript
return isProd ? "Internal Server Error" : (error as Error).message;
```

Wait—you ARE checking `isProd`? Good. But the global error handler on line 27 **logs the full error to console** regardless of environment. In production, this means sensitive data (DB connection strings, user emails, stack traces) in your logs.

**Fix:** Sanitize logs in production. Never log full error objects.

### 3. `any` Type Casts — Type Safety Theater
**Files:**
- `apps/server/src/modules/reviews/reviews.routes.ts:61,85,109,139`
- `apps/server/src/modules/winemakers/winemakers.routes.ts:25`
- `apps/server/src/modules/role-requests/role-requests.routes.ts:30`

You're using `: any` type casts to silence the compiler. **This defeats the entire purpose of TypeScript.** If you don't know the type, figure it out. If Elysia's types are hard, use `unknown` and type guards.

### 4. No Rate Limiting Anywhere
There is **zero rate limiting** on any endpoint. A malicious actor can:
- Spam your order creation endpoint → drain your stock atomically in a loop
- Hammer your search endpoints → DoS your DB
- Abuse guest session creation → bloat your database

**Fix:** Add rate limiting middleware (e.g., `@elysiajs/rate-limit`) on auth endpoints and order creation at minimum.

### 5. CORS Configuration — Bare Minimum
**File:** `apps/server/src/app.ts:34`

```typescript
.use(cors({ origin: frontendUrl }))
```

No `credentials: true`, no `allowedHeaders` configuration, no method restrictions. You're allowing **everything** from your frontend origin. Add explicit allowed headers (especially if you add custom auth headers later).

---

## 🏗️ ARCHITECTURAL PROBLEMS

### 6. Dual Schema Duplication — Maintenance Nightmare
**File:** `apps/server/src/modules/admin/admin.schema.ts`

You maintain **Zod schemas AND TypeBox schemas** for the same data. Look at lines 10-19 vs 73-82 — they're the same thing twice. When you add a field, you'll forget one. When you change validation, you'll change the wrong one.

**Why this exists:** Elysia wants TypeBox, OpenAPI generation wants Zod.  
**The fix:** Use a single schema source and transform. Or pick one and commit. Orval + Zod is fine; generate OpenAPI from Zod. Don't manually mirror schemas.

### 7. Singleton + Constructor Injection — Confused DI
**Pattern seen in:**
- `apps/server/src/modules/orders/orders.service.ts:207-212`
- `apps/server/src/modules/carts/carts.service.ts:110`

You define a class with constructor injection (good for testing!), then immediately export a singleton instance with hardcoded deps (bad for testing!).

```typescript
// You wrote this:
export class OrdersService {
  constructor(private ordersRepo: IOrdersRepository, ...) {}
}
export const ordersService = new OrdersService(ordersRepository, cartsService, ...);
```

**Why this hurts:** Your tests mock the repositories, but the service is already instantiated with real deps. You're relying on module mocking (`vi.mock`) which is fragile.

**Fix:** Use a DI container or at minimum, export the class and let the app compose instances.

### 8. String-Based Error Codes — 90s Called
**File:** `apps/server/src/utils/errors.ts` and throughout services

```typescript
throw new Error("NOT_FOUND");
throw new Error("FORBIDDEN");
throw new Error("CART_EMPTY");
```

This is **not error handling**. It's string matching from 1995. You lose:
- Stack traces (overwritten)
- Error metadata (which resource wasn't found?)
- Type safety (no discriminated union)

**Fix:** Create proper error classes:
```typescript
class AppError extends Error {
  constructor(public code: string, public status: number, message: string) {
    super(message);
  }
}
```

### 9. Inconsistent Auth Patterns
Some routes use `requireAuth`, others `requireRoles`, others `requireCapability`. **Pick one pattern and stick to it.** The existence of three macros that do nearly the same thing creates cognitive load and bugs.

---

## 💾 DATABASE & SCHEMA ISSUES

### 10. No Visible Indexes on Foreign Keys
**File:** `packages/shared/src/schemas/orders.ts`

You define foreign keys but I don't see explicit indexes:
```typescript
userId: uuid("user_id").references(() => users.id),
guestSessionId: uuid("guest_session_id").references(() => guestSessions.id),
```

Drizzle doesn't auto-index FKs. Your queries on `orders.userId` or `order_items.order_id` will table-scan on large datasets.

**Fix:** Add `.index()` to frequently queried foreign keys.

### 11. Soft Delete Inconsistency
Some schemas have `deletedAt`, others don't. Some queries filter `isNull(deletedAt)`, others don't. This inconsistency means **deleted data shows up in some places but not others**.

**Fix:** Either go all-in on soft deletes (add `deletedAt` to every table, add global query filters) or don't. Half-measures are worse than nothing.

### 12. Hardcoded Shipping Fee
**File:** `apps/server/src/modules/orders/orders.service.ts:113,164`

```typescript
shippingFee: "10.00",
const shippingFee = 10;
```

Hardcoded in two places. What if shipping costs change? What if you support international shipping? What if different shops have different fees?

**Fix:** Make this configurable (DB config table, environment variable, or per-shop setting).

---

## 🎨 FRONTEND ISSUES

### 13. Axios Interceptor — Silent Failures
**File:** `apps/web/src/lib/axios.ts:42`

```typescript
const token = await window.Clerk?.session?.getToken().catch(() => null);
```

If `getToken()` fails, you silently continue with no token. The request fails later with a 401, but the user gets no feedback. **Handle auth failures explicitly** — redirect to login, show a toast, something.

### 14. `useRoles` Hook — No Validation
**File:** `apps/web/src/hooks/useRoles.ts:4-7`

```typescript
export function useRoles(): AppRole[] {
  const { sessionClaims } = useAuth();
  return (sessionClaims?.roles as AppRole[]) ?? [];
}
```

You're trusting Clerk's JWT payload without validation. If someone tampers with the token (edge case, but still), you're assigning arbitrary roles. **Validate the roles against your `AppRole` enum/type.**

### 15. No Error Boundaries Visible
I don't see React error boundaries in the route tree. When your API calls fail, the entire app will crash. **Add error boundaries** around route segments.

---

## 🧪 TESTING PROBLEMS

### 16. `as any` and `as never` Everywhere in Tests
**Files:** Nearly every `*.test.ts` file

```typescript
vi.mocked(db.query.wines.findMany).mockResolvedValue(mockWines as never);
```

You're mocking implementation details (`db.query.X.findMany`) and using type casts to shut up TypeScript. This means:
- Tests break when you refactor internals (even if behavior is same)
- Type casts hide real type errors

**Fix:** Mock at the repository level, not the DB query level. Test behavior, not implementation.

### 17. Inconsistent Test Patterns
Some tests mock `findMany`, others mock the entire repository. Some use `createOrdersRoutes(mockAuthPlugin as any)`, others don't. **Establish one testing pattern and document it.**

### 18. No Integration Tests
All tests are unit tests with heavy mocking. **You have zero tests that verify the full stack** (route → service → repository → DB). One schema change and your API silently breaks.

---

## 📦 CONFIGURATION & DEVOPS

### 19. Environment Variables — No Validation
**File:** `apps/server/src/app.ts:20-22`

```typescript
const isProd = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const apiUrl = process.env.API_URL || "http://localhost:3000";
```

No validation that these env vars are actually URLs. No startup check. If `FRONTEND_URL` is malformed, CORS fails silently.

**Fix:** Use a validation library (zod/env, t3-env) to validate env vars at startup.

### 20. No Health Check Endpoint
Your app has no `/health` or `/ready` endpoint. You can't do proper Kubernetes/cloud deployment without it. Add one.

---

## ✅ WHAT YOU DID RIGHT (Yes, Really)

1. **Monorepo structure** — Good separation of concerns with `apps/` and `packages/`
2. **Drizzle ORM** — Type-safe queries, good migration system
3. **Repository pattern** — `IOrdersRepository` interface is good practice
4. **Transaction support** — `orders.repository.ts:64` uses `db.transaction()` correctly
5. **Frozen addresses on orders** — Good practice for audit trails
6. **Orval for API generation** — Reduces boilerplate
7. **Biome over ESLint** — Faster, simpler, better defaults

---

## 🎯 PRIORITY FIX LIST

**Do these BEFORE deploying to production:**

1. **HIGH:** Remove duplicated auth macros (Issue #1)
2. **HIGH:** Add rate limiting (Issue #4)
3. **HIGH:** Fix error handling — use proper error classes (Issue #8)
4. **MEDIUM:** Add DB indexes on foreign keys (Issue #10)
5. **MEDIUM:** Unify schema definitions (Issue #6)
6. **MEDIUM:** Validate env vars at startup (Issue #19)
7. **LOW:** Clean up test mocks (Issue #16)
8. **LOW:** Add health check endpoint (Issue #20)

---

## FINAL WORDS

This codebase is a **solid B- student project** that needs to grow up fast to be production-ready. The foundation is there — you chose good tools and patterns. But the execution is inconsistent, the error handling is naive, and the security is surface-level.

**Stop adding features. Fix the foundation first.**

A house built on sand might look nice during the open house, but the first storm takes it down.

---
**Next audit date:** After critical issues #1-4 are resolved.  
**Auditor signature:** Senior Dev Mentor (Adversarial Mode) 🔥
