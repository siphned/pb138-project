# Audit — Full Project Status (2026-04-26)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Gemini CLI (Agent)
- **Scope:** Full Project Review (Branch: `test/multi-role-deleted-products`)
- **Status:** OPEN

## Summary
The project has successfully reached the end of Phase 2 with robust RBAC, multi-vendor support, and guest sessions. However, a deep dive into the current branch revealed a critical mismatch in the Reviews module and several major inconsistencies in how soft-deletes are handled across the repository layer. The current branch also contains significant uncommitted work that needs verification.

---

## Findings

### P1 - Critical

#### C-03: Reviews Module Schema/Repository Mismatch
- **Area:** backend / database
- **Current state:** `reviews.repository.ts` targets separate `product_reviews` and `winemaker_reviews` tables.
- **Root Cause:** A planned refactor to a unified table was documented as "done" in previous audits but the implementation was partially reverted or never fully applied to the schema.
- **Impact:** All review operations will fail at runtime because the repository is inconsistent with the live schema.
- **Action:** Sync the repository logic with the schema or finalize the schema refactor.

---

### P2 - Major

#### M-06: Frontend Axios Global Leakage
- **Area:** frontend
- **File:** `apps/web/src/components/AxiosInterceptor.tsx`
- **Finding:** Still using global `axios.defaults` which conflicts with the modular `customInstance` approach.
- **Action:** Standardize on instance-based auth injection.

#### M-07: Soft-Delete Integrity Gaps
- **Area:** backend
- **Findings:**
  - `eventsRepository.findMany` does not filter out events whose winemaker owner is deleted.
  - `ordersRepository.findById` does not filter deleted products from the order items relation.
- **Action:** Implement recursive soft-delete checks or join-level filters.

#### M-08: Uncommitted State Bloat
- **Area:** project management
- **Finding:** The branch `test/multi-role-deleted-products` has significant uncommitted changes in `carts`, `orders`, and `users` modules.
- **Impact:** High risk of merge conflicts and loss of work.
- **Action:** Stage and commit logical units of work immediately.

---

### P3 - Minor

#### L-04: Non-Standardized Mocking in Tests
- **Area:** testing
- **Finding:** Inconsistent patterns between `(db as any)` casts and the newer `MockDatabase` interface.
- **Action:** Bulk refactor test files to use the `MockDatabase` interface.

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-21 | Use `timestamptz` for all columns | Global consistency and accuracy | ✅ done |
| D-24 | Finalize Unified Reviews Table | Simplify model and resolve C-03 | 🔄 pending |
| D-25 | Instance-based Axios Auth | Prevent global state pollution | 🔄 pending |

---

## Revision History
- **2026-04-26** — Full project status audit created.
