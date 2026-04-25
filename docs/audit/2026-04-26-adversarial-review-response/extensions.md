# Audit Extensions — Response & Deeper Dive (2026-04-26)

This document extends the 2026-04-26 audit with a direct response to the Adversarial Review and new findings from a deeper codebase investigation.

---

## Response to Adversarial Review (2026-04-26)

The Adversarial Review's position that previous findings remain unresolved is **incorrect** and appears to be based on a stale repository state. 

### Verified Status of Claims:
1.  **A-01 (deletedAt in supply_agreements)**: ✅ **RESOLVED**. Confirmed in `supply-agreements.ts`.
2.  **A-02 (Carts filtering)**: ✅ **RESOLVED**. Confirmed in `carts.repository.ts`.
3.  **A-03 (className in UI)**: ✅ **RESOLVED**. Confirmed in `packages/ui/src/button.tsx`.
4.  **A-04 (OpenAPI Tags)**: ✅ **RESOLVED**. Confirmed in `apps/server/src/app.ts`.
5.  **A-06 (timestamptz)**: ✅ **RESOLVED**. Confirmed across all schema files and migration `0003`.

---

## New Verified Findings

### C-03: Critical - Reviews Module Schema Mismatch
- **Area:** backend / database
- **Current state:** `reviews.repository.ts` still references `productReviews` and `winemakerReviews` tables.
- **Root Cause:** The 2026-04-25 audit incorrectly claimed this was a "polymorphic unified table" refactor, but the schema file `reviews.ts` still contains separate tables. The repository is effectively pointing to a non-existent or inconsistent model.
- **Impact:** Broken runtime for all review features.

### M-06: Major - Global Axios Defaults Leakage
- **Area:** frontend
- **File:** `apps/web/src/components/AxiosInterceptor.tsx`
- **Finding:** The component sets `axios.defaults.baseURL` and `axios.defaults.headers.common.Authorization`. 
- **Impact:** This is a security risk in a shared environment and causes race conditions. It also contradicts the project strategy of using the `customInstance` defined in `apps/web/src/lib/custom-instance.ts`.
- **Action:** Delete `AxiosInterceptor.tsx` and move auth logic entirely into the custom instance.

### M-07: Major - Missing Winemaker Checks in Events
- **Area:** backend
- **File:** `apps/server/src/modules/events/events.repository.ts`
- **Finding:** `findMany` and `countMany` do not join with `winemakers` to check if the winemaker is soft-deleted.
- **Impact:** Deleted winemakers' events still appear in public listings.

---

## Decisions Log (New)

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-21 | Remove AxiosInterceptor | Use instance-based auth to prevent global leakage | 🔄 pending |
| D-22 | Sync Reviews Repository | Resolve schema/code divergence | 🔄 pending |
| D-23 | Global Winemaker Join | Prevent orphans from showing in public lists | 🔄 pending |

---

## Revision History
- **2026-04-26** — Response and extensions filed by Gemini CLI.
