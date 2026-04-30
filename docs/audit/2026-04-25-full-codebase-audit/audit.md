# Audit — Comprehensive System Integrity (2026-04-26)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Gemini CLI (Agent)
- **Scope:** Full codebase review (`dev` branch)
- **Status:** OPEN

## Summary
The system has completed Phase 2 but several architectural regressions and inconsistencies have been identified. The most critical is a mismatch between the refactored database schema (unified `reviews` table) and the repository layer which still targets separate product/winemaker review tables. Additionally, soft-delete patterns are applied inconsistently, and frontend JSX continues to use invalid `class` attributes.

---

## Findings

### P1 - Critical

#### C-01: Repository/Schema Mismatch (Reviews)
- **Area:** backend / database
- **Current state:** `reviews.repository.ts` attempts to query `productReviews` and `winemakerReviews` tables. 
- **Divergence:** The database schema was recently refactored to a unified `reviews` table using a polymorphic or single-table pattern. The repository was never updated.
- **Impact:** All review-related functionality is currently broken at runtime.
- **Action items:** Rewrite `reviews.repository.ts` and `reviews.service.ts` to use the unified `reviews` table.

#### C-02: Missing Foreign Key in `events`
- **Area:** database
- **Current state:** `events` table is missing `addressId`.
- **Divergence:** Events require a location. The `insertEvents` factory in `seed.ts` expects this column.
- **Impact:** Cannot create events with locations; seed script likely fails or skips data.
- **Action items:** Add `addressId` to `events` table and update relations.

---

### P2 - Major

#### M-01: Inconsistent Soft Delete Implementation
- **Area:** database / backend
- **Findings:**
  - `supply_agreements` is missing `deletedAt`.
  - `cartsRepository.findByIdWithItems` leaks deleted products into active carts.
  - `winesRepository.findAll` does not verify if the winemaker itself is deleted.
- **Action items:** Standardize `isNull(deletedAt)` across all repository fetch operations.

#### M-02: Widespread JSX `class=` Anti-pattern
- **Area:** frontend
- **Current state:** Widespread use of `class=` instead of `className=` in `apps/web/src`.
- **Action items:** Bulk replace `class="` with `className="`.

#### M-03: Chained Database Call Errors in Tests
- **Area:** testing
- **Current state:** Several repository tests use `(db as any)` or incorrect mocking for chained Drizzle calls (e.g., `.where().returning()`), leading to brittle tests and type errors.
- **Action items:** Standardize on the `MockDatabase` interface pattern established in recent refactors.

---

### P3 - Minor

#### L-01: API Metadata Missing Tags
- **Area:** backend
- **Current state:** Central `openapi` config in `app.ts` is missing descriptions for `carts`, `orders`, `guest-sessions`, and `supply-agreements`.
- **Action items:** Synchronize `app.ts` with all registered modules.

#### L-02: Expired Guest Session Pruning
- **Area:** backend / maintenance
- **Current state:** Guest sessions have an `expiresAt` column but no automated or manual pruning mechanism exists.
- **Action items:** Add an admin-only cleanup route or a background task.

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-18 | Standardize on `timestamptz` | Prevent timezone-related ordering and display bugs | 🔄 pending |
| D-19 | Unified `reviews` repository | Align with refactored schema | 🔄 pending |
| D-20 | Mandatory `deletedAt` filtering | Ensure relational integrity during soft deletes | 🔄 pending |

---

## Revision History
- **2026-04-26** — Comprehensive audit created after Phase 2 completion.
