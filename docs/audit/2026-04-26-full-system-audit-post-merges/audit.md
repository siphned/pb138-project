# Audit — Full System Review (Post-Merges)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Gemini CLI (Agent)
- **Scope:** Full monorepo audit after unreviewed merges (#50-#56)
- **Status:** 🔴 **CRITICAL FAILURES**

## 1. Technical Integrity (Immediate Regressions)
The `dev` branch is currently in a broken state due to unreviewed merges.

### 1.1 Dependency Mismatches (Ondra's PR #50)
- **Problem:** `apps/server/src/modules/email/email.service.ts` imports `resend`, but the `resend` package is not declared in `apps/server/package.json` nor in the root `package.json`.
- **Impact:** 
    - **Build Failure:** `bun run build` will likely fail.
    - **Type Check Failure:** `tsc` fails in the server package.
    - **Test Failure:** Multiple test suites are crashing because they transitively import the broken email service.

### 1.2 Biome Violations (PR #52)
- **Problem:** Unused console logs in `apps/server/src/modules/role-requests/role-requests.service.ts`.
- **Impact:** CI/CD pipeline warnings (or errors if strict mode is on).

### 1.3 Test Suite Instability
- **Problem:** 5 critical test suites are failing on the server side due to the dependency issue mentioned in 1.1.
- **Affected Suites:**
    - `carts.routes.test.ts`
    - `guest-sessions.routes.test.ts`
    - `orders.routes.test.ts`
    - `role-requests.service.test.ts`
    - `supply-agreements.routes.test.ts`

## 2. Database Schema Audit
Reviewing the impact of merges on the database layer.

### 2.1 Schema Inconsistencies
- **Problem:** The `user_roles` table was added (#52) but the `users` table still contains a `role` field.
- **Problem:** Missing `deletedAt` and `updatedAt` columns on several new tables (`user_roles`, `product_wines`, `cart_items`).
- **Standardization Gap:** The project mandate (Audit F-01/F-02) requires `timestamptz` for all date columns and universal soft-delete support.

## 3. Auth Integration Audit
- **Problem:** The frontend `main.tsx` still has commented out or residual logic related to the old `AxiosInterceptor` which was supposed to be replaced by `customInstance`.
- **Problem:** Inconsistent use of `requireAuth` and `requireRoles` macros across new routes in #50 and #52.

## 4. Immediate Action Items
1.  **Fix Dependencies:** Install `resend` in `apps/server`.
2.  **Clean Biome Warnings:** Remove or suppress console logs in `role-requests.service.ts`.
3.  **Database Hardening:**
    -   Apply missing standard columns (`updatedAt`, `deletedAt`) to all tables.
    -   Standardize all timestamp columns to `timestamptz`.
    -   Verify recursive soft-delete filtering in all repositories.
4.  **Backend Integration:** Ensure `Admin` and `Reviews` routes are correctly wired into the main application.
5.  **Final Verification:** Restore the **Build -> Type-Check -> Test** green state.

---
*End of initial audit report.*
