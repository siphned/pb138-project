# Audit — Major Project Audit (2026-04-26)

## Meta
- **Date:** 2026-04-26
- **Auditor:** Claude Haiku 4.5 (Automated Audit Agent)
- **Scope:** Full project (dev branch, apps/server, apps/web, packages)
- **Status:** 🔴 **OPEN** (2 failing tests, 4 linting warnings, architecture gaps, type errors blocking build)

---

## Summary

The WineMarket project is a multi-vendor wine marketplace at **Week 8 implementation phase** with substantial backend and frontend coverage. Recent work (commits af2a495-650aeef) stabilized authentication, implemented stock management, and achieved zero-warning baseline for code quality. However, the **dev branch currently fails TypeScript compilation and has 2 failing test suites**, preventing merge to main. The admin module is **fully implemented but not wired into the main app**, creating a 2-week stale feature. Core architectural patterns (RBAC, carts, orders) are solid with good test coverage (198 passing tests), but routing/macro binding issues in reviews and admin modules must be resolved before release.

---

## Findings

### P0 — CRITICAL (Blocks Operation)

---

#### **A-01: Admin Routes Not Integrated Into App**
- **Area:** backend / architecture
- **Severity:** critical
- **Status:** ❌ open
- **Current state:** Admin module (admin.routes.ts, admin.service.ts, admin.repository.ts) is **complete and tested but never imported or registered** in apps/server/src/app.ts. The module exports fully functional user management, event moderation, and review deletion endpoints—none of which are accessible to the API.
- **Expected state:** Per CLAUDE.md architecture, all modules are registered in app.ts via `.use(routeModule)`. Admin routes must be imported and added to the Elysia app like all other modules.
- **Divergence:** Recent changes (visible in biome output) added admin.routes.test.ts and finalized admin.routes.ts, but integration was never completed. This is a 14-commit lag on dev branch.
- **Evidence:**
  - apps/server/src/app.ts:1-68 — imports 13 modules (users, carts, orders, etc.) but **no admin import**
  - apps/server/src/modules/admin/index.ts exports adminRoutes
  - apps/server/src/modules/admin/admin.routes.ts lines 1-200 define complete /admin/* endpoints with role guards
- **Action items:**
  - [ ] Add import: `import { adminRoutes } from "./modules/admin";` to apps/server/src/app.ts (after line 15)
  - [ ] Register route: Add `.use(adminRoutes)` to app in app.ts (after line 68, before final semicolon)
  - [ ] Run `bun run check` to verify no Biome violations
  - [ ] Run `bun run check-types` to confirm TypeScript build succeeds
  - [ ] Run `bun run test` to verify all tests pass
  - [ ] Commit: "feat(admin): wire admin routes into main app"

---

#### **A-02: TypeScript Build Fails — 8 Type Errors Blocking Compilation**
- **Area:** backend / type safety
- **Severity:** critical
- **Status:** ❌ open
- **Current state:** `bun run check-types` fails with 8 errors in admin and reviews modules, preventing build:
  - admin.routes.test.ts:26 — Macro mock incompatible with Elysia's Macro type signature
  - admin.routes.ts:12, :48 — Response type mismatch (returning DB row instead of schema-defined shape)
  - reviews.routes.ts:43, :72, :97, :127 — `dbUser` and `clerkPayload` undefined (auth macro not properly applied)
- **Expected state:** Per CLAUDE.md, routes must satisfy Elysia's strict type system. All handlers must use proper type annotations, and auth macros must inject typed context.
- **Divergence:** Recent refactoring separated concerns but broke the macro-to-route connection. The reviews routes use `.use(authPlugin)` but routes don't inherit the macro context properly.
- **Evidence:**
  - apps/server/src/modules/admin/admin.routes.ts:50 — `body.status as any` (line 50 has explicit `any` cast instead of proper union)
  - apps/server/src/modules/reviews/reviews.routes.ts:43 — POST /product/:id tries to access `dbUser` but context isn't typed
  - apps/server/src/modules/admin/admin.routes.test.ts:26 — mock `.macro()` returns incompatible shape
- **Action items:**
  - [ ] Fix admin.routes.ts:50 — Remove `as any` and properly type `body.status` as union literal
  - [ ] Fix reviews.routes.ts — Add `.use(authPlugin)` guard with `requireAuth: true` on protected routes (POST /product/:id, POST /winemaker/:id, DELETE /product/:id, DELETE /winemaker/:id)
  - [ ] Fix admin.routes.test.ts:26 — Mock macro to return proper Macro shape, not a function returning object
  - [ ] Ensure all async route handlers return Response | statusCode | data, not Promise<data> when using Elysia `.use()`
  - [ ] Run `bun run check-types` to verify zero errors

---

#### **A-03: Two Failing Route Tests (422 Unprocessable Entity Instead of Expected 204)**
- **Area:** backend / testing
- **Severity:** critical
- **Status:** ❌ open
- **Current state:** Test suite fails:
  - src/modules/admin/admin.routes.test.ts — "DELETE /admin/reviews/:id returns 204" → got 422
  - src/modules/reviews/reviews.routes.test.ts — "DELETE /reviews/product/:id/:reviewId deletes product review" → got 422
  - Root cause: Macro mock in test doesn't properly set up auth context, so routes reject with 422 (unprocessable entity) instead of executing normally
- **Expected state:** Tests should pass. 422 indicates the request can't be processed—likely because `dbUser` is undefined due to missing macro context injection.
- **Divergence:** Tests mocked the authPlugin but the mock doesn't properly replicate the real macro's behavior. Routes expect `dbUser` from the macro, but it's undefined, causing Elysia to reject the request.
- **Evidence:**
  - apps/server/src/modules/admin/admin.routes.test.ts:17-31 — Mock returns incomplete Macro shape
  - apps/server/src/modules/reviews/reviews.routes.test.ts:20 — `mockUser: any` suggests typing issues
  - Test output: "expected 422 to be 204"
- **Action items:**
  - [ ] Refactor admin.routes.test.ts mock to properly type auth context
  - [ ] Use `.derive()` instead of `.macro()` in test to inject `dbUser` and `clerkPayload`
  - [ ] Refactor reviews.routes.test.ts similarly
  - [ ] Run `bun run test` to confirm both tests pass

---

### P1 — MAJOR (Contradicts Architecture)

---

#### **A-04: 72 Uses of `any` Type Across Backend Code**
- **Area:** backend / type safety
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `grep -r "any" apps/server/src` returns 72 matches across non-test code. CLAUDE.md states "No `any` without extreme justification," but current codebase violates this systematically.
- **Expected state:** All `any` types removed or justified with // biome-ignore comments and explicit reasoning.
- **Divergence:** Codebase grew rapidly without strict type enforcement. Biome linter is set to warn (`"noExplicitAny": "warn"`), not error, so violations accumulate.
- **Evidence:**
  - apps/server/src/modules/admin/admin.routes.ts:50 — `body.status as any`
  - apps/server/src/modules/reviews/reviews.routes.test.ts:20 — `mockUser: any = { id: "u1" }`
  - 70 other uses across service, repository, and route files
- **Action items:**
  - [ ] Enable `"noExplicitAny": "error"` in biome.json to enforce rule
  - [ ] Audit top 10 `any` uses by frequency and replace with concrete types
  - [ ] For unavoidable uses, add `// biome-ignore suspicious/noExplicitAny: <reason>` comment
  - [ ] Commit: "refactor: eliminate explicit `any` types for type safety"

---

#### **A-05: Admin Module Not Listed in OpenAPI Documentation Tags**
- **Area:** backend / documentation
- **Severity:** major
- **Status:** ❌ open
- **Current state:** apps/server/src/app.ts lines 29-42 define OpenAPI tags for all modules (users, role-requests, shops, etc.) but **admin is absent**. The /admin/* endpoints exist but aren't discoverable in the API spec.
- **Expected state:** Per CLAUDE.md patterns, all modules must be documented. Admin should have its own tag in the openapi metadata.
- **Divergence:** Admin module was added later and documentation was never updated.
- **Evidence:**
  - apps/server/src/app.ts:29-42 — tags list doesn't include { name: "admin", description: "..." }
  - apps/server/src/modules/admin/admin.routes.ts:6 — tags: ["admin"] defined in the routes, but not in app.ts registry
- **Action items:**
  - [ ] Add to tags array in app.ts openapi config: `{ name: "admin", description: "Admin moderation and user management" }`
  - [ ] Verify all /admin routes have `detail: { tags: ["admin"], ... }`

---

#### **A-06: Reviews Routes Missing Auth Guard Annotations**
- **Area:** backend / security
- **Severity:** major
- **Status:** ❌ open
- **Current state:** reviews.routes.ts POST and DELETE endpoints access `dbUser` and `clerkPayload` but **don't declare `requireAuth: true`** in route options. Routes rely on implicit auth from `.use(authPlugin)`, which is fragile.
- **Expected state:** Per authPlugin pattern, protected routes must explicitly declare `requireAuth: true` or `requireRoles: ["role"]` in the detail options. This documents the requirement and enables automatic OpenAPI spec generation.
- **Divergence:** Reviews routes were refactored but lost explicit auth guards in their route declarations.
- **Evidence:**
  - apps/server/src/modules/reviews/reviews.routes.ts:41-67 (POST /product/:id) — no `requireAuth: true` in options
  - Same for POST /winemaker/:id (lines 70-92), DELETE routes (lines 95-153)
  - Compare to users.routes.ts:21-24 which has explicit `requireAuth: true`
- **Action items:**
  - [ ] Add `requireAuth: true` to detail options for all protected routes
  - [ ] Update OpenAPI documentation in detail field to include `security: [{ bearerAuth: [] }]`
  - [ ] Run `bun run check-types` to ensure no side effects

---

### P2 — MINOR (Convention/Missing)

---

#### **A-07: Biome Linting Warnings (4 Fixable)**
- **Area:** backend / code quality
- **Severity:** minor
- **Status:** 🔄 pending (auto-fixable)
- **Current state:** `bun run check` reports 4 warnings:
  - admin.routes.test.ts:1 — unused import `t` (safe to remove)
  - admin.routes.ts:50 — `noExplicitAny` (body.status as any)
  - reviews.routes.test.ts:1 — unused import `t` (safe to remove)
  - reviews.routes.test.ts:20 — `noExplicitAny` (mockUser: any)
- **Expected state:** Zero warnings. All imports used, no explicit `any` types.
- **Divergence:** Recent changes introduced these warnings. Biome is set to warn, not error.
- **Evidence:**
  - `bun run check` output shows "Found 4 warnings"
  - Specific files and line numbers listed above
- **Action items:**
  - [ ] Remove unused `t` import from admin.routes.test.ts:1
  - [ ] Remove unused `t` import from reviews.routes.test.ts:1
  - [ ] Replace `body.status as any` with proper type in admin.routes.ts:50
  - [ ] Replace `mockUser: any` with typed mock in reviews.routes.test.ts:20
  - [ ] Run `bun run check` to confirm zero warnings

---

#### **A-08: Web Frontend Test Coverage Severely Imbalanced (372 lines for 5 tests)**
- **Area:** frontend / testing
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** Frontend has only 5 test files totaling 372 lines (60+90+172+43+7 from placeholder):
  - AuthenticatedLayout.test.tsx (60 lines, 6 tests)
  - Sidebar.test.tsx (90 lines, tests not counted)
  - UserContext.test.tsx (172 lines, tests not counted)
  - useRoles.test.ts (43 lines, 3 tests)
  - placeholder.test.ts (7 lines, 1 test)
  - Backend has 198 passing tests across 32 files
- **Expected state:** Frontend and backend should have comparable test coverage. Frontend critical paths (cart, checkout, auth flows) lack automated tests.
- **Divergence:** Focus has been on backend stabilization; frontend tests are placeholder-heavy.
- **Evidence:**
  - apps/web/src/__tests__/ directory listing shows only 5 real test files
  - apps/server/src has 32 test files with 198 passing tests
  - No E2E tests for checkout, cart flow, or multi-role workflows
- **Action items:**
  - [ ] Add unit tests for cart context/hooks (add-to-cart, merge flow)
  - [ ] Add RTL tests for checkout form validation
  - [ ] Add integration tests for role-based UI rendering
  - [ ] Establish minimum 80% coverage target for frontend modules

---

#### **A-09: Inconsistent Error Handling Patterns Across Modules**
- **Area:** backend / consistency
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** Error handling varies:
  - admin.routes.ts:50-53 uses `try/catch` with string comparison (`e.message === "NOT_FOUND"`)
  - reviews.routes.ts uses similar pattern (lines 47-52, 77-78)
  - Some modules use custom error classes, others use string messages
  - No centralized error enum or type-safe error handling
- **Expected state:** Uniform error handling with typed error classes or error enum. All error catches should be type-safe.
- **Divergence:** Modules grew independently without a shared error handling convention.
- **Evidence:**
  - apps/server/src/modules/admin/admin.routes.ts:52 — `if (e instanceof Error && e.message === "NOT_FOUND")`
  - apps/server/src/modules/reviews/reviews.routes.ts:49 — similar pattern
  - No shared error.ts or errors enum file in modules/
- **Action items:**
  - [ ] Create shared apps/server/src/modules/errors.ts with typed error classes
  - [ ] Define AppError class with code property for easy matching
  - [ ] Refactor all `e.message === "STRING"` comparisons to use error code
  - [ ] Add to CLAUDE.md: error handling convention

---

#### **A-10: Guest Sessions Module Not Wired Into App Error Handling**
- **Area:** backend / architecture
- **Severity:** minor
- **Status:** 🔄 pending (wired but not documented)
- **Current state:** Guest sessions are created and stored correctly, but error cases (e.g., expired session, orphaned cart) are not documented in API spec.
- **Expected state:** OpenAPI spec should document session expiry, merge behavior, and error responses.
- **Divergence:** Implementation is complete; documentation lags.
- **Evidence:**
  - apps/server/src/modules/guest-sessions/guest-sessions.routes.ts defines endpoints
  - No OpenAPI error codes documented for session expiry scenarios
- **Action items:**
  - [ ] Add detail descriptions for session-related errors in routes
  - [ ] Document 410 Gone status for expired sessions
  - [ ] Update CLAUDE.md with guest session lifecycle details

---

### P3 — LOW (Observations)

---

#### **A-11: 14 Unmerged Commits on Dev Branch (Feature Lag)**
- **Area:** git / workflow
- **Severity:** low
- **Status:** 🔄 pending
- **Current state:** `git log --oneline -20` shows dev is 14 commits ahead of origin/dev, including:
  - af2a495 (auth fix)
  - 98fa26f (build success)
  - 41b5561 (filtering stabilization)
  - 650aeef (checkout implementation)
  - Plus 10 more
- **Expected state:** Main dev branch (origin/dev) reflects latest. Local dev should push regularly.
- **Divergence:** Local development hasn't been pushed to remote, creating drift.
- **Evidence:**
  - `git status` output: "Your branch is ahead of 'origin/dev' by 14 commits"
  - Commits visible in `git log` are not on origin/dev
- **Action items:**
  - [ ] After resolving A-01, A-02, A-03, run `git push origin dev`
  - [ ] Verify CI/CD passes on remote dev

---

#### **A-12: TypeScript Strict Mode Enabled But Not Fully Enforced**
- **Area:** frontend / type safety
- **Severity:** low
- **Status:** ✅ resolved (partial)
- **Current state:** apps/web/tsconfig.app.json:26-30 enables strict mode, noUnusedLocals, noUnusedParameters, but frontend still has implicit `any` in some hooks.
- **Expected state:** All frontend modules pass strict TypeScript without implicit `any`.
- **Divergence:** Configuration is correct; some older code predates strict adoption.
- **Evidence:**
  - apps/web/tsconfig.app.json:26 — "strict": true
  - apps/web/src/generated/* likely has `any` from Orval code generation (OK to exclude)
- **Action items:**
  - [ ] Verify generated code is excluded from tsconfig
  - [ ] No action needed if all non-generated code passes

---

#### **A-13: Route Tree Generation Not Documented**
- **Area:** frontend / process
- **Severity:** low
- **Status:** ✅ resolved
- **Current state:** apps/web/src/routeTree.gen.ts (639 lines) is auto-generated and committed. Process is not documented.
- **Expected state:** CLAUDE.md or README should explain that routeTree is generated by TanStack Router CLI and shouldn't be hand-edited.
- **Divergence:** Documentation gap.
- **Evidence:**
  - File exists and is committed (routeTree.gen.ts)
  - No instructions in CLAUDE.md about regeneration
- **Action items:**
  - [ ] Add to CLAUDE.md: "Frontend routes are auto-generated. Run `bun run generate` after adding/modifying apps/web/src/routes/*.tsx files to update routeTree.gen.ts."

---

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | Admin module wiring should unblock P0 before other fixes | Admin is complete but inaccessible; this is the root blocker for API completeness | **pending** |
| D-02 | TypeScript errors in admin/reviews routes must be fixed before tests can pass | Build failure (check-types) prevents test validation and deployment | **pending** |
| D-03 | Biome warnings should be auto-fixed immediately | 4 fixes are safe and improve code quality; no risk | **pending** |
| D-04 | Error handling should be standardized across backend to improve maintainability | Consistency reduces bugs and aids debugging; recommend creating shared error types | **pending** |
| D-05 | Frontend tests need dedicated sprint to match backend coverage | 198 backend tests vs. 5 frontend tests is asymmetric; user-facing flows lack E2E validation | **pending** |

---

## Outstanding Work

### P0 — Critical (Blocks Operation)

1. **Wire admin routes into main app** — Import and register adminRoutes in app.ts
2. **Fix TypeScript build** — Resolve 8 type errors in admin and reviews modules
3. **Fix failing tests** — Update auth mock in test suites to properly inject context

### P1 — High (Contradicts Architecture)

1. **Eliminate `any` types** — Enable strict linting rule and audit 72 uses
2. **Add admin to OpenAPI tags** — Document /admin endpoints in spec
3. **Add auth guards to reviews routes** — Explicitly declare `requireAuth: true` in route options

### P2 — Medium (Convention/Missing)

1. **Fix Biome warnings** — Remove 4 unused imports and explicit `any` types
2. **Expand frontend test coverage** — Add unit, integration, and E2E tests for critical user flows
3. **Standardize error handling** — Create shared error classes and refactor all error comparisons
4. **Document guest session lifecycle** — Clarify session expiry and cart merge behavior

### P3 — Low (Observations)

1. Push 14 local commits to origin/dev after stabilization
2. Add route tree generation instructions to CLAUDE.md
3. Verify generated code exclusions in tsconfig

---

## Revision History

- **2026-04-26** — Initial comprehensive audit filed. Identified critical integration gap (admin routes not wired), 8 blocking type errors, 2 failing tests, 72 `any` type violations, and asymmetric test coverage. All findings actionable and prioritized by severity.
