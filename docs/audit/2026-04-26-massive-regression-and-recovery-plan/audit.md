# Audit — Massive Regression & Recovery Plan (2026-04-26)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Gemini CLI (Agent)
- **Scope:** Full Project Audit (`dev` branch)
- **Status:** 🚨 CRITICAL FAILURE

## Summary
A major audit of the `dev` branch confirms a catastrophic regression. A series of "keep dev version" merges performed on 2026-04-26 (commits `c8f9931` to `5d96a17`) resulted in the deletion of approximately **20,000+ lines of code, tests, and documentation**. Core modules (`admin`, `events`, `reviews`) have been completely removed or reverted to a broken, stale state.

---

## Findings

### P0 — Critical (Lost Content)

#### C-01: Backend Module Wipe
- **Modules Lost:** `admin`, `events`, `reviews`.
- **Status:** All repositories, services, and routes for these modules were deleted from the file system during the recent merges.
- **Root Cause:** Merge strategy `-X ours` was incorrectly used when merging feature branches into `dev`.

#### C-02: Integration Test Wipe
- **Tests Lost:** All API integration tests for `carts`, `orders`, `guest-sessions`, and `supply-agreements`.
- **Impact:** System-wide business logic has zero verification.

#### C-03: Multi-Role System Regression
- **Finding:** The `user_roles` junction table and RBAC logic (from `WINE-140`) are missing. The `dev` branch has reverted to a singular `role` field.
- **Impact:** Security model is broken.

#### C-04: Documentation Wipe
- **Finding:** 6,400+ lines of PDF and Markdown design documentation in `raw/` and `docs/audit/` were deleted.

---

### P1 — Major (Process)

#### M-01: Inconsistent CI/Local Scripts
- **Finding:** `bun run test` defaults to watch mode, which hangs in automated environments.
- **Finding:** `bun run generate` does not terminate on `app.stop()`.

---

## Recovery Plan

1.  **Immediate Hard Reset**: Reset `dev` branch to commit `9dbd128` (the last known healthy state containing all Phase 2 work).
2.  **Re-merge parallel fixes**: Re-apply specific fixes from `test/multi-role-deleted-products` (e.g. `WINE-141`) manually or via clean merges.
3.  **Harden CI Scripts**: Update `package.json` to use `vitest run` and fix termination in `export-spec.ts`.
4.  **Verification**: Execute the full validation trio (**check, check-types, test**) immediately after recovery.

---

## Revision History
- **2026-04-26** — Massive regression audit and recovery plan filed.
