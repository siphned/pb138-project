# Audit — Secondary Consistency Review (2026-04-26)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Gemini CLI (Agent)
- **Scope:** Full codebase review (`dev` branch)
- **Status:** OPEN

## Summary
This audit provides a secondary review of the system state, directly responding to the Adversarial Review and expanding the investigation into deeper architectural layers. Most adversarial claims regarding missing Phase 2 features were refuted by direct evidence, but several critical and major regressions were confirmed in the Reviews, Auth, and Event modules.

---

## Response to Adversarial Review (2026-04-26)

The claims that findings A-01, A-02, A-03, A-04, and A-06 remain unresolved are **Refuted**.

### Evidence:
- **A-01 (deletedAt in supply_agreements)**: Present in `supply-agreements.ts:16`.
- **A-02 (Carts filtering)**: Logic verified in `carts.repository.ts:47-51`.
- **A-03 (className in UI)**: Verified in `packages/ui/src/button.tsx:16`.
- **A-04 (OpenAPI Tags)**: Present in `apps/server/src/app.ts:37-40`.
- **A-06 (timestamptz)**: Correct implementation verified across all schema files.

---

## Verified Findings (Expanded)

### P1 - Critical

#### C-03: Reviews Module Table Mismatch
- **Area:** backend / database
- **Current state:** `reviews.repository.ts` targets `product_reviews` and `winemaker_reviews` tables separately.
- **Root Cause:** A previous audit (2026-04-25) incorrectly claimed a unified table refactor was complete. The schema files still contain separate tables, causing a code/model mismatch.
- **Impact:** Runtime failure for all review features.
- **Action:** Decide between a unified table or multi-table approach and synchronize the repository.

---

### P2 - Major

#### M-06: Frontend Axios Global Leakage
- **Area:** frontend
- **File:** `apps/web/src/components/AxiosInterceptor.tsx`
- **Finding:** The component sets `axios.defaults` globally. 
- **Impact:** Security risk for token leakage in shared environments and contradictions with the `customInstance` pattern in `lib/custom-instance.ts`.
- **Action:** Move auth logic to the custom instance and delete the interceptor component.

#### M-07: Soft-Delete Gaps in Events & Orders
- **Area:** backend
- **Files:** `events.repository.ts`, `orders.repository.ts`
- **Finding:** 
  - `eventsRepository.findMany` does not check if the winemaker is soft-deleted.
  - `ordersRepository.findById` does not filter deleted products from `orderItems`.
- **Impact:** Public listing of orphan data and inconsistent order history.

---

### P3 - Minor

#### L-03: Missing Non-Null Validations in Repositories
- **Area:** backend
- **Finding:** Several repository methods use `as never` or `as any` to bypass Drizzle type checks rather than implementing strict null checks for returned database rows.
- **Action:** Implement explicit error throwing for failed inserts/updates (e.g. `if (!row) throw new Error(...)`).

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-21 | Kill AxiosInterceptor | Standardize on instance-based auth | 🔄 pending |
| D-22 | Audit Order stock decrements | Ensure F-16 is fully closed in OrdersService | 🔄 pending |
| D-23 | Uniform Repository Mocking | Standardize `MockDatabase` interface in tests | 🔄 pending |

---

## Revision History
- **2026-04-26** — Secondary audit and refutation created.
