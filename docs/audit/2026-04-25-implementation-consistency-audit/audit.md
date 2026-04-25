# Audit — Architecture & Implementation Integrity (2026-04-25)

> **⚠️ ADVISORY: This audit has been challenged.** See `replies.md` for adversarial review with contradictory evidence. Status should remain **OPEN** until findings are verified against actual codebase.

## Meta
- **Date:** 2026-04-25
- **Auditor:** Gemini CLI (Agent)
- **Scope:** Full stack post-Phase 2 implementation (RBAC, Carts, Orders, Supply Agreements)
- **Status:** ❌ OPEN (challenged via replies.md)

## Summary

The system has transitioned to a robust RBAC model and implemented core business modules. However, several consistency issues were identified: soft-delete logic is incomplete in new modules, TypeScript errors exist in the UI package, OpenAPI metadata is incomplete, and background maintenance tasks are missing. **All findings were marked resolved in extensions.md but verification against codebase shows otherwise.**

---

## Findings

### A-01: Missing `deletedAt` in `supply_agreements`
- **Area:** database
- **Severity:** major
- **Status:** ❌ open (claimed ✅ resolved in extensions.md)
- **Current state:** `supply_agreements` schema has no `deletedAt` column
- **Expected state:** All primary entities should support soft delete per architecture decision
- **Divergence:** New module implemented without consistency check against existing patterns
- **Evidence:** `apps/server/src/db/schema/supply-agreements.ts:5-16` — no `deletedAt` column exists
- **Action items:**
  - [ ] Add `deletedAt: timestamptz("deleted_at")` to supplyAgreements schema
  - [ ] Create migration file
  - [ ] Update repository to filter `isNull(deletedAt)`

### A-02: Cart Returns Soft-Deleted Products
- **Area:** backend
- **Severity:** major
- **Status:** ❌ open (claimed ✅ resolved in extensions.md)
- **Current state:** `cartsRepository.findByIdWithItems` returns products regardless of `deletedAt`
- **Expected state:** Carts should only show active products
- **Divergence:** Query join does not filter on `products.deletedAt`
- **Evidence:** `apps/server/src/modules/carts/carts.repository.ts:27-38` — `product: true` with no filter
- **Action items:**
  - [ ] Update query to filter deleted products
  - [ ] Add test case for deleted product in cart

### A-03: `class` vs `className` Type Error in `@repo/ui`
- **Area:** frontend
- **Severity:** critical
- **Status:** ❌ open (claimed ✅ resolved in extensions.md)
- **Current state:** `@repo/ui` primitive components use `class=` attribute, fails TypeScript check
- **Expected state:** React components must use `className` per React/TypeScript conventions
- **Divergence:** Inherited from Base UI patterns without adapting to standard React types
- **Evidence:**
  ```
  $ bun run check-types
  @repo/ui:check-types: error TS2322: Property 'class' does not exist
  src/button.tsx(15,7): error
  src/card.tsx(16,7): error
  src/code.tsx(10,16): error
  ```
- **Note:** `apps/web` uses `@base-ui/react` which provides custom type definitions — this passes. Only `@repo/ui` fails.
- **Action items:**
  - [ ] Change `class=` to `className=` in `packages/ui/src/button.tsx:50`
  - [ ] Fix similar patterns in `card.tsx`, `code.tsx`
  - [ ] Verify `bun run check-types` passes

### A-04: Incomplete OpenAPI Tag Definitions
- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open (claimed ✅ resolved in extensions.md)
- **Current state:** `carts`, `orders`, `guest-sessions`, `supply-agreements` tags used in routes but missing from OpenAPI config
- **Expected state:** All tags should be documented in central `app.ts` OpenAPI block
- **Divergence:** Tags added to route definitions after initial OpenAPI setup
- **Evidence:** `apps/server/src/app.ts:28-36` defines 7 tags, missing 4 that exist in routes
- **Action items:**
  - [ ] Add missing tag definitions to `app.ts`
  - [ ] Add descriptions for each tag

### A-05: Guest Session Cleanup Not Implemented
- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open (claimed ✅ resolved in extensions.md)
- **Current state:** `cleanupExpired()` method exists but delete is commented out; no trigger exists
- **Expected state:** Expired sessions should be pruned automatically
- **Divergence:** Method stubbed but never connected to a trigger
- **Evidence:**
  ```ts
  // apps/server/src/modules/guest-sessions/guest-sessions.repository.ts:22-26
  async cleanupExpired(): Promise<void> {
    // This would be called by a cron job or similar
    // For now just providing the capability
    // await db.delete(guestSessions).where(...);  // COMMENTED OUT
  }
  ```
- **Action items:**
  - [ ] Uncomment and implement cleanup logic
  - [ ] Add admin route or startup hook to trigger cleanup

### A-06: Inconsistent Timestamp Types
- **Area:** database
- **Severity:** minor
- **Status:** ❌ open (claimed ✅ resolved in extensions.md)
- **Current state:** Mix of `timestamp` and `timestamptz` across schema files
- **Expected state:** Consistent use of `timestamptz` for all time columns
- **Divergence:** Schema files created at different times with different conventions
- **Evidence:**
  | File | `timestamp` | `timestamptz` |
  |------|-------------|---------------|
  | orders.ts | ✅ all | ❌ |
  | sellers.ts | ✅ all | ❌ |
  | users.ts | ✅ all | ❌ |
  | catalog.ts | ❌ | ✅ all |
  | events.ts | ❌ | ✅ all |
  | carts.ts | ❌ | ✅ all |
- **Action items:**
  - [ ] Audit all schema files
  - [ ] Migrate `timestamp` → `timestamptz`
  - [ ] Create migration

### A-07: Multiple Modules Missing Soft Delete (NEW)
- **Area:** database
- **Severity:** major
- **Status:** ❌ open
- **Current state:** Tables without `deletedAt`: supply_agreements, role_requests, availability, guest_sessions, carts, cart_items
- **Expected state:** Soft delete should be evaluated for all entities based on business requirements
- **Divergence:** Pattern established for some entities but not systematically applied
- **Action items:**
  - [ ] Audit each table for soft delete requirement
  - [ ] Add `deletedAt` where appropriate
  - [ ] Update repository queries

### A-08: Inconsistent Error Handling (NEW)
- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** 103 `throw new Error("CODE")` statements across codebase with string codes
- **Expected state:** Standardized error handling with custom error class or enum
- **Divergence:** Each module implemented error handling independently
- **Action items:**
  - [ ] Create `AppError` class or error code enum
  - [ ] Audit and update error throws
  - [ ] Document error code conventions

### A-09: Non-Standardized Auth Pattern (NEW)
- **Area:** backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** Mix of `requireAuth`/`requireRoles` decorators and manual `if (!user)` checks
- **Expected state:** Consistent use of plugin decorators
- **Divergence:** Routes implemented auth differently over time
- **Evidence:**
  - `orders.routes.ts:61`: Manual `if (!user) return status(401)`
  - `products.routes.ts`: Uses `requireAuth` decorator
- **Action items:**
  - [ ] Audit all routes for auth pattern
  - [ ] Standardize to decorator pattern or document manual approach

### A-10: No Runtime Request Validation (NEW)
- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** No Zod or runtime validation library in use
- **Expected state:** Runtime validation for all request bodies
- **Divergence:** Only compile-time types via Elysia's `t.*` schemas
- **Action items:**
  - [ ] Evaluate adding Zod for runtime validation
  - [ ] Or document that compile-time validation is sufficient

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-09 | Enforce `timestamptz` everywhere | Standardize timezone handling | ❌ open |
| D-10 | Fix `@repo/ui` className usage | TypeScript compliance | ❌ open |
| D-11 | Prune expired guest sessions | Prevent database bloat | ❌ open |
| D-12 | Add soft delete to supply_agreements | Data integrity | ❌ open |
| D-13 | Filter deleted products in carts | User experience | ❌ open |
| D-14 | Standardize error handling | API consistency | ❌ open |

---

## Outstanding Work

### P0 — Critical (blocks operation)
1. **A-03** — Fix `@repo/ui` TypeScript errors (`bun run check-types` fails)
2. **A-02** — Filter deleted products from cart (users see unavailable items)

### P1 — High (contradicts architecture)
3. **A-01** — Add `deletedAt` to `supply_agreements`
4. **A-09** — Standardize auth patterns across routes

### P2 — Medium (convention/missing features)
5. **A-04** — Complete OpenAPI tag definitions
6. **A-05** — Implement guest session cleanup
7. **A-06** — Migrate `timestamp` to `timestamptz`
8. **A-08** — Standardize error handling

### P3 — Low (observations)
9. **A-07** — Audit soft delete coverage
10. **A-10** — Evaluate runtime validation

---

## Revision History

- **2026-04-26** — Adversarial review filed (replies.md) challenging all "resolved" claims
- **2026-04-25 (late)** — All findings marked ✅ resolved in extensions.md
- **2026-04-25 (mid)** — Audit expanded with additional findings A-07 through A-10
- **2026-04-25 (early)** — Initial audit created