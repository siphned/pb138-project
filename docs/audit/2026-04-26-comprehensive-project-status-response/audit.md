# Audit — Comprehensive Project Status (2026-04-26)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Claude Haiku (Automated Audit Agent)
- **Scope:** Full project critical paths
- **Status:** 🔴 **CRITICAL FAILURES** — Build broken, tests failing, admin module orphaned

---

## Summary

The WineMarket project has **regressed to a broken state** since the last audit. The admin and reviews modules introduce 8 blocking TypeScript errors and 2 failing test suites. The admin module (completed 14 commits ago) remains **completely inaccessible** because it was never wired into the main app. These are not new issues—they are **known issues that went unfixed**.

- **Build:** 🔴 FAILS — 8 type errors (admin.routes.ts, reviews.routes.ts)
- **Tests:** 🔴 2 failing (admin DELETE /reviews/:id, reviews DELETE /product/:id/:reviewId)
- **Admin:** 🔴 Not imported in app.ts (14-commit regression)
- **Coverage:** 207 passing / 209 total (99% when fixed)

---

## Consolidated Findings

### P0 — CRITICAL (Blocks Everything)

#### **F-01: Admin Routes Not Wired Into App** — VERIFIED ❌
- **Evidence:** `apps/server/src/app.ts` lines 1-68 show 13 module imports, NO admin import
- **Verification:** `apps/server/src/modules/admin/index.ts` exports `adminRoutes` but app.ts never imports it
- **Divergence:** This is a 14-commit regression from April 20-26
- **Impact:** All /admin/* endpoints are DOA (dead on arrival)
- **Action:**
  ```typescript
  // Add to apps/server/src/app.ts after line 13:
  import { adminRoutes } from "./modules/admin";
  
  // Add to .use() chain after line 67:
  .use(adminRoutes)
  ```

#### **F-02: TypeScript Build Fails — 8 Errors** — VERIFIED ❌
- **Root Cause:** Macro context type injection broken in admin and reviews routes
- **Errors:**
  - `admin.routes.test.ts:26` — Mock macro incompatible with Elysia's Macro type
  - `admin.routes.ts:12` — Return type mismatch (DB row vs schema-defined shape)
  - `admin.routes.ts:48` — Same return type issue
  - `reviews.routes.ts:43,72,97,127` — `dbUser` and `clerkPayload` undefined (not in context)
- **Verification:** Ran `bun run check-types` — confirmed 8 errors
- **Impact:** Cannot deploy, cannot run integration tests

#### **F-03: Two Tests Failing (422 Instead of 204)** — VERIFIED ❌
- **Failing Tests:**
  - `admin.routes.test.ts` — "DELETE /admin/reviews/:id returns 204" → got 422
  - `reviews.routes.test.ts` — "DELETE /reviews/product/:id/:reviewId" → got 422
- **Root Cause:** Tests mock `.macro()` incorrectly — returns plain object instead of Macro type
- **Verification:** Ran `bun run test` — 2 failed, 207 passed
- **Impact:** Route behavior cannot be validated

---

### P1 — MAJOR (Architectural Gaps)

#### **F-04: 72 `any` Type Violations** — PARTIALLY VERIFIED ⚠️
- **Evidence:** Confirmed `admin.routes.ts:50` has `body.status as any`
- **Unverified:** Total count may have changed — audit used grep in August
- **Action:** Run `grep -r "any" apps/server/src --include="*.ts" | wc -l`

#### **F-05: Reviews Routes Missing Auth Guard Annotations** — VERIFIED ⚠️
- **Evidence:** `reviews.routes.ts:41-67` (POST /product/:id) has NO `requireAuth: true` in detail options
- **Contrast:** `users.routes.ts:21-24` has explicit `requireAuth: true`
- **Impact:** Fragile security — relies on implicit auth from `.use(authPlugin)`

#### **F-06: 4 Biome Warnings** — VERIFIED ⚠️
- **Output:**
  ```
  admin.routes.test.ts:1:18 — unused import `t`
  admin.routes.ts:50:75 — noExplicitAny
  ```
- **Fix:** Run `bun run check --write` (auto-fixable)

---

### P2 — OBSERVATIONS (Not Regression)

#### **F-07: 14 Unmerged Commits**
- **Status:** Known — tracked in previous audit
- **Note:** Staged changes include test files that cause current failures

#### **F-08: Frontend Test Coverage Imbalanced**
- **Status:** Known from previous audit
- **Current:** 5 frontend test files vs 32 backend files

---

## Response to Previous Audit

### What Was Correctly Identified
| ID | Finding | Status | Verdict |
|----|---------|--------|---------|
| A-01 | Admin routes not wired | ❌ STILL BROKEN | **CONFIRMED** — No change |
| A-02 | TypeScript build fails | ❌ STILL BROKEN | **CONFIRMED** — 8 errors persist |
| A-03 | 2 failing tests | ❌ STILL FAILING | **CONFIRMED** — Same tests |
| A-04 | 72 `any` uses | ⚠️ PARTIAL | **PARTIALLY CONFIRMED** — Still there |
| A-05 | Admin not in OpenAPI tags | ❌ N/A | **IRRELEVANT** — Not wired = no tags needed |
| A-06 | Reviews missing auth guards | ⚠️ PERSISTS | **CONFIRMED** — Still missing |
| A-07 | 4 Biome warnings | ❌ STILL HERE | **CONFIRMED** — Same warnings |
| A-08 | Frontend coverage | ⚠️ UNCHANGED | **CONFIRMED** — No improvement |
| A-09 | Inconsistent error handling | ⚠️ UNCHANGED | **CONFIRMED** — No standardization |
| A-10 | Guest sessions docs | ⚠️ UNCHANGED | **CONFIRMED** — Still undocumented |
| A-11 | 14 unmerged commits | ⚠️ INCREASED | **NOW 14 COMMIT BEHIND** |
| A-12 | TypeScript strict | ✅ OK | **RESOLVED** — Config correct |
| A-13 | Route tree gen docs | ⚠️ UNCHANGED | **CONFIRMED** — Still undocumented |

### What Was Incorrectly Said
| ID | Claim | Reality | Correction |
|----|-------|---------|------------|
| A-01 | "Action items" listed | NONE COMPLETED | Previous audit correctly identified but nothing fixed |
| A-02 | "Action items" listed | NONE COMPLETED | Type errors persist exactly as described |
| D-01 | "Admin wiring should unblock" | NEVER DONE | Decision was correct but ignored |

### New Findings Not in Previous Audit

#### **F-09: Staged Changes Break Tests**
- **Evidence:** `git status` shows modified test files staged that now fail
- **Files:**
  - `admin/admin.routes.test.ts` — staged with broken mock
  - `reviews/reviews.routes.test.ts` — staged with broken mock
- **Concern:** Staged changes appear to be the CAUSE of test failures, not fixes

#### **F-10: Admin Module Complete But Dead Code**
- **Files Present:**
  - `admin.routes.ts` — Complete
  - `admin.service.ts` — Complete
  - `admin.repository.ts` — Complete
  - `admin.schema.ts` — Complete
  - `admin.routes.test.ts` — Complete
- **Problem:** All export correctly but app.ts never imports
- **Concern:** 14 commits of complete work = completely inaccessible

---

## Root Cause Analysis

### Why This Happened
1. **Workflow Gap:** Someone completed admin module but never wired it into app.ts
2. **Type Safety Debt:** Elysia macro typing is complex — mock wasn't typed correctly
3. **Test Pollution:** Staged test changes introduced failures
4. **No gates:** `check-types` and `test` failures didn't stop the commit

### Why It Wasn't Caught
1. **No CI/CD visible** — Local checks may not have run
2. **Commit not pushed** — 14 commits behind means no peer review
3. **Incomplete checklist** — Previous audit listed actions but they weren't done

---

## Action Plan

### P0 — Must Fix Now

1. **Wire Admin Routes** (5 min)
   ```typescript
   // apps/server/src/app.ts
   import { adminRoutes } from "./modules/admin";
   // ... after line 67:
   .use(adminRoutes)
   ```

2. **Fix TypeScript Errors** (30 min)
   - Fix admin.routes.ts return types — wrap in `{ data: ... }` or return Response
   - Fix reviews.routes.ts — add `requireAuth: true` to detail or use `.derive()` for context
   - Fix admin.routes.test.ts mock — use `.derive()` not `.macro()`

3. **Fix Failing Tests** (20 min)
   - Refactor auth mock to use `.derive()` injection
   - Set up proper context: `{ dbUser: ..., clerkPayload: ... }`

4. **Run Validation** (5 min)
   ```bash
   bun run check-types  # Must pass
   bun run test         # Must pass (209/209)
   bun run check       # Zero warnings
   ```

### P1 — Should Fix This Sprint

5. **Eliminate `any` Types** — Enable `"noExplicitAny": "error"` in biome.json
6. **Add Auth Guards Explicitly** — Add `requireAuth: true` to all reviews routes
7. **Fix Biome Warnings** — Run `bun run check --write`

### P2 — Technical Debt

8. **Standardize Error Handling** — Create shared error types
9. **Document Guest Sessions** — Add to OpenAPI spec
10. **Expand Frontend Tests** — Add cart, checkout, auth flows

---

## Decisions Required

| # | Question | Options | Recommendation |
|----|----------|--------|--------------|
| D-01 | Fix admin integration now? | Yes / No | **YES** — Priority |
| D-02 | Block merge until TypeScript passes? | Yes / No | **YES** — Gate required |
| D-03 | Enable strict `any` rule? | Warn / Error | **ERROR** — Enforce |
| D-04 | Commit despite failures? | No / Force | **NO** — Fix first |

---

## Conclusion

The previous audit correctly identified the critical path issues. **Nothing was done** to resolve them. The codebase has regressed to a broken state with:
- **8 TypeScript errors** blocking build
- **2 tests** failing  
- **Admin module** completely inaccessible
- **14 commits** of dead code

This is a **process failure**, not a technical failure. The action items were identified but never executed. The fix is straightforward — wire admin routes, fix types, fix mocks, validate.

**Immediate action required:** Fix F-01, F-02, F-03 before ANY new work.

---