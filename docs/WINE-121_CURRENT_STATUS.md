# WINE-121 Status & Integration Plan

**Date:** 2026-04-25  
**Branch:** WINE-121-wire-clerk-auth-to-frontend  
**Status in Jira:** In Progress (assigned to Matěj Šinogl)  
**Commits on branch:** 12 (2 documentation + 10 implementation/fixes)

---

## Current Situation

### ✅ What's on WINE-121
- Clerk auth integration to frontend (token management, guards, API integration)
- All 9 audit findings resolved (backend RBAC, API schemas, JSX fixes, dashboard)
- Full project build passes with zero errors
- Dev servers running successfully

### 🔄 What's Changed in DEV (Merges Since WINE-121 Started)

The following completed modules have been merged to `dev`:

| Task | Module | Status | Merged Date |
|------|--------|--------|------------|
| **WINE-59** | User dashboard skeleton + component library | ✅ Done | Recent |
| **WINE-63** | Wines module (CRUD, winemaker profiles) | ✅ Done | Recent |
| **WINE-64** | Shops, Products & Bundles module | ✅ Done | Recent |
| **WINE-66** | Events module (CRUD, registration, comments) | ✅ Done | Recent |
| **WINE-56** | Users module (profiles, addresses, roles) | ✅ Done | Earlier |
| **WINE-118** | Test suite CI fixes | ✅ Done | Earlier |

**Dev is now 67 commits ahead of main** (containing all the above merged work)

**WINE-121 is now 12 commits ahead of dev** (with audit resolution work)

### ⚠️ The Merge Challenge

```
main
 │
 ├─ dev (67 commits ahead, includes WINE-59, WINE-63, WINE-64, WINE-66)
 │   │
 │   └─ [merged]: WINE-59, WINE-63, WINE-64, WINE-66, WINE-56, WINE-118
 │
 └─ WINE-121 (12 commits ahead of dev)
    │
    └─ [contains]: Audit resolution for backend RBAC, API schemas, JSX fixes
```

When WINE-121 merges to dev, it will need to handle potential conflicts with:
- Dashboard components (WINE-59 changes)
- User profile/addresses (WINE-56 changes)
- Wine, Shop, Product modules (WINE-63, WINE-64 changes)
- Event module (WINE-66 changes)

---

## What WINE-121 Does

### Backend Fixes (9 Audit Findings Resolved)

**B-04: RBAC Guards**
- `PATCH /shops/:id` → `requireRoles: ["shop_owner", "admin"]`
- `PUT /wines/:id`, `DELETE /wines/:id` → `requireRoles: ["winemaker", "admin"]`

**B-05: Cart Merge on Login**
- Added `cartsService.mergeOnLogin()` to carts/orders `.derive()` blocks

**B-06: Status Codes**
- `POST /role-requests/` now returns 201 Created (not 200)

**B-07: Response Schemas**
- Added schemas for cart/order routes so Orval generates typed hooks

**B-09: Type Safety**
- Narrowed `as any` casts in winemakers routes to only return values

### Frontend Fixes

**B-02: JSX Attributes**
- Fixed 558 `class=` → `className=` attribute replacements
- Fixed `for=` → `htmlFor=` for accessibility

**B-08: Dashboard Role Wiring**
- Connected role switcher to actual Clerk roles via `useRoles()` hook
- Computed available roles from user's actual permissions
- Default to primary role instead of arbitrary state

### Database Fixes

**B-03: Schema Cleanup**
- Deleted orphaned migration `0003_bored_lily_hollister.sql`
- Verified journal consistency

---

## Jira Task Status Breakdown

**Core Backend Modules:**
- ✅ WINE-59: Dashboard (Done) → **Merged to dev**
- ✅ WINE-56: Users (Done) → **Merged to dev**
- ✅ WINE-63: Wines (Done) → **Merged to dev**
- ✅ WINE-64: Shops/Products (Done) → **Merged to dev**
- ✅ WINE-66: Events (Done) → **Merged to dev**
- 🟡 WINE-65: Cart/Orders (In Progress)
- 🟡 WINE-67: Reviews (Ready for Review)
- 🟡 WINE-79: Admin (Ready for Review)

**Current Task:**
- 🟡 **WINE-121: Clerk Auth Frontend (In Progress)** ← YOU ARE HERE

**Blocked Testing (Waiting for feature work):**
- 🔴 WINE-60: Playwright E2E setup (Blocked)
- 🔴 WINE-61: Auth integration tests (Blocked)
- 🔴 WINE-74: Checkout/event E2E tests (Blocked)

---

## Before Merging to DEV

### ✅ Already Done
- Full build passes
- Type checking passes
- Linting passes
- Dev servers running
- Dashboard functional

### 🔲 Before PR Review
1. **Rebase on latest dev** (to pick up WINE-59, 63, 64, 66 merges)
   ```bash
   git fetch origin dev
   git rebase origin/dev
   # Resolve any conflicts from merged modules
   git push -f origin WINE-121-wire-clerk-auth-to-frontend
   ```

2. **Verify build still passes after rebase**
   ```bash
   bun run build
   bun run check-types
   bun run check
   ```

3. **Test dashboard + auth** on the dev-merged code
   - Does role switcher still work?
   - Do RBAC guards still protect write endpoints?
   - Are response schemas still correct?

### 🔲 For PR/MR Creation
1. Create PR title: `[WINE-121] Resolve Clerk auth audit findings`
2. Link to this branch and the 9 audit findings in description
3. Note dependencies on WINE-65, WINE-79 (not yet merged)
4. Mention that this PR includes:
   - Backend RBAC guard upgrades
   - JSX compliance fixes (558 attribute corrections)
   - Dashboard role switcher integration
   - Response schema additions for Orval generation

### 🔲 For Code Review
**Key areas to focus on:**
- RBAC guard placement (backend security layer)
- Cart merge-on-login logic (session handling)
- JSX attribute correctness (React compliance)
- Dashboard role computation (matches Clerk roles)
- Response schema completeness (Orval integration)

---

## Commits on WINE-121 (Ready for PR)

All 12 commits are small, focused, and logically grouped:

```
754b87d — docs: verified Jira task mapping
bbedf8f — docs: Jira task mapping analysis
f1a596c — fix(WINE-121): resolve all 9 audit findings
f762d7f — docs: audit folder structure finalization
49b011f — fix(ui): className attribute fixes
b947684 — feat(server): repository/service consistency
dd4bc11 — feat(db): timestamp standardization & soft-delete
5d8d32d — docs: audit structure migration
708e80b — docs: CLAUDE.md Phase 2 update
9f54a3e — chore: vitest run configuration
9138168 — test: comprehensive unit test suites
21a5795 — test: repository & web test setup
```

**Recommendation:** Squash to 2-3 commits for merge:
- 1 commit: All audit fixes (B-01 through B-09)
- 1 commit: Test/infrastructure setup
- 1 commit: Documentation updates

---

## Risk Assessment

### Low Risk 🟢
- JSX attribute fixes (pure syntax, no logic)
- Response schema additions (non-breaking)
- Audit documentation (no code impact)

### Medium Risk 🟡
- RBAC guard changes (affects authorization flow)
- Dashboard role wiring (new integration point)
- Cart merge-on-login (session handling)

**Mitigation:** All changes already pass build + type checking + linting

### High Risk 🔴
None identified. All audit findings are resolutions to previously identified issues, not new features or breaking changes.

---

## Timeline

- **Today (2026-04-25):** Branch ready for rebase + review
- **Next:** Rebase on latest dev, verify build
- **Then:** Create PR/MR with description
- **Review:** Code review against audit findings
- **Merge:** Squash to dev branch

---

## Quick Reference: What Each Commit Does

| Commit | Category | Changes | Impact |
|--------|----------|---------|--------|
| f1a596c | **Core Fix** | Resolves 9 audit findings | High |
| 49b011f | **Code Quality** | JSX className fixes | Medium |
| dd4bc11 | **Infrastructure** | DB schema standardization | Low-Medium |
| b947684 | **Consistency** | Backend module refactoring | Low |
| f762d7f, 5d8d32d | **Process** | Audit documentation structure | None (process) |
| 708e80b | **Documentation** | CLAUDE.md Phase 2 | None (docs) |
| 9f54a3e, 9138168, 21a5795 | **Testing** | Test setup & suites | Medium (setup) |
| 754b87d, bbedf8f | **Documentation** | Jira mapping analysis | None (docs) |

---

## Decision Points for Matej (Team Lead)

1. **Rebase strategy:** Should WINE-121 pick up all dev merges before PR, or merge as-is?
   - **Recommendation:** Rebase to pick up WINE-59, 63, 64, 66 (they're Done and may conflict)

2. **Squash or keep commits?** 
   - **Recommendation:** Squash to 3 commits (audit fixes, tests, docs)

3. **Merge directly to dev or via intermediate review?**
   - **Recommendation:** Create PR/MR for code review, then merge to dev

4. **When to unblock WINE-65, WINE-67, WINE-79?**
   - **Recommendation:** After WINE-121 is merged, pull those branches up to latest dev before merging them

---

## Summary

WINE-121 is complete and ready for code review. It resolves all 9 audit findings discovered in the Clerk auth integration. Dev has moved forward with 5 additional modules merged, so a rebase is recommended before PR creation.

**Next action:** Rebase WINE-121 on latest dev, verify build, then create PR.
