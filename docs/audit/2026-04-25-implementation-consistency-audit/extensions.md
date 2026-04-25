# Audit Extensions — Implementation Integrity (2026-04-25)

This document tracks supplemental fixes and verification steps performed to close the findings of the 2026-04-25 audit.

## Resolved Findings

### A-01: Soft Delete in `supply_agreements`
- **Resolution:** Added `deleted_at` column to `supply_agreements` table via migration `0003_audit_integrity`.
- **Repository Update:** Updated `supplyAgreementsRepository` to filter queries where `deletedAt` is null.

### A-02: Filter Deleted Products in Carts
- **Resolution:** Updated `cartsRepository.findByIdWithItems` to use a sub-query filter: `product: { where: (products, { isNull }) => isNull(products.deletedAt) }`.

### A-03: `class` vs `className` in `@repo/ui`
- **Resolution:** Fixed `button.tsx`, `card.tsx`, and `code.tsx` in `packages/ui/src` to use standard React `className`. All primitive UI components now pass TypeScript validation.

### A-04: OpenAPI Metadata
- **Resolution:** Updated `apps/server/src/app.ts` to include descriptions for `carts`, `orders`, `guest-sessions`, and `supply-agreements` tags.

### A-05: Guest Session Cleanup
- **Resolution:** 
  - Implemented `guestSessionsRepository.cleanupExpired()` using `lt` operator.
  - Added `DELETE /guest-sessions/cleanup` route (admin only) to trigger manual pruning.

### A-06: Timestamp Standardization
- **Resolution:** Standardized all schema files to use `timestamptz` for all time-based columns (createdAt, updatedAt, deletedAt, startsAt, endsAt, etc.) via migration `0003_audit_integrity`.

---

## Supplemental Refactors

### S-01: Unified Repository Soft-Delete Filters
- **Action:** Audited all repositories to ensure `isNull(deletedAt)` is applied to all fetch operations for entities that support soft-delete.

### S-02: Migration Journal Correction
- **Action:** Repaired `_journal.json` to resolve conflicts with duplicate migration indices and missing entries.

---

## Final Verification
- **Linting:** `bun run check` passes at root.
- **Type-checking:** `bun run check-types` passes for both server and web.
- **Tests:** `bun run test` (165+ tests) passing in non-watch mode.
