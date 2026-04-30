# Audit Extensions — Implementation Integrity (2026-04-25)

> ⚠️ **NOTE:** This document was written describing intended resolutions that have NOT been verified against the codebase. See `replies.md` for adversarial review. All "resolved" items below remain **❌ open**.

This document was intended to track supplemental fixes and verification steps for the 2026-04-25 audit.

## Intended Resolutions (NOT VERIFIED)

### A-01: Soft Delete in `supply_agreements`
- **Intended Resolution:** Add `deleted_at` column to `supply_agreements` table via migration
- **Intended Repository Update:** Filter queries where `deletedAt` is null
- **Status:** ❌ NOT DONE (schema lacks `deletedAt` column)

### A-02: Filter Deleted Products in Carts
- **Intended Resolution:** Update `cartsRepository.findByIdWithItems` to filter soft-deleted products
- **Intended Code:** `product: { where: (products, { isNull }) => isNull(products.deletedAt) }`
- **Status:** ❌ NOT DONE (no filter exists)

### A-03: `class` vs `className` in `@repo/ui`
- **Intended Resolution:** Fix `button.tsx`, `card.tsx`, and `code.tsx` in `packages/ui/src`
- **Status:** ❌ NOT DONE (`bun run check-types` still fails)

### A-04: OpenAPI Metadata
- **Intended Resolution:** Update `app.ts` with descriptions for `carts`, `orders`, `guest-sessions`, `supply-agreements`
- **Status:** ❌ NOT DONE (tags still missing from OpenAPI config)

### A-05: Guest Session Cleanup
- **Intended Resolution:**
  - Implement `guestSessionsRepository.cleanupExpired()` using `lt` operator
  - Add `DELETE /guest-sessions/cleanup` route (admin only)
- **Status:** ❌ NOT DONE (delete is commented out, no route exists)

### A-06: Timestamp Standardization
- **Intended Resolution:** Standardize all schema files to use `timestamptz`
- **Status:** ❌ NOT DONE (mixed `timestamp`/`timestamptz` confirmed)

---

## Intended Supplemental Refactors (NOT VERIFIED)

### S-01: Unified Repository Soft-Delete Filters
- **Intended Action:** Audit all repositories for `isNull(deletedAt)` application
- **Status:** ❌ NOT DONE

### S-02: Migration Journal Correction
- **Intended Action:** Repair `_journal.json` for migration conflicts
- **Status:** ❌ NOT DONE

---

## Actual Verification Results

### Current State (2026-04-26)

| Check | Result |
|-------|--------|
| `bun run check-types` | ❌ FAIL — `@repo/ui` TypeScript errors |
| `grep "deletedAt" apps/server/src/db/schema/supply-agreements.ts` | ❌ NO MATCH |
| `grep "isNull.*deletedAt" apps/server/src/modules/carts/` | ❌ NO MATCH |
| `grep -E "(carts|orders|guest-sessions|supply-agreements)" apps/server/src/app.ts` | ❌ Only 7 tags defined |

### Test Results
```
$ bun run test
server:test:  Test Files  27 passed (27)
server:test:  Tests     165 passed (165)
web:test:   Test Files  2 passed (2)
web:test:   Tests     4 passed (4)
```
Tests pass, but unit tests mock repository behavior and don't catch these issues.

---

## Required Actions

To actually close this audit, the following must be done:

1. [ ] Add `deletedAt` to `supply_agreements` schema and create migration
2. [ ] Update `cartsRepository` to filter deleted products
3. [ ] Fix `class` → `className` in `@repo/ui` primitive components
4. [ ] Add missing OpenAPI tags to `app.ts`
5. [ ] Implement and trigger guest session cleanup
6. [ ] Migrate all `timestamp` to `timestamptz`
7. [ ] Run `bun run check-types` and verify it passes