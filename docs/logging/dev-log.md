# Development Log — Migration & Setup

Date: 2026-04-12

Summary
- Migrated repository from GitLab (gitlab.fi.muni.cz/xsinogl/pb138-project) to GitHub (github.com/siphned/pb138-project).
- Preserved full commit history and branches.
- Recreated merge requests as GitHub pull requests and adjusted bases for `feature/docs-*` branches to target `feature/docs`.
- Added a GitHub Actions CI workflow that mirrors the original `.gitlab-ci.yml` pipeline.

Actions performed
1. Created a WIP commit to capture local changes: `chore(migration): save WIP before GitHub migration`.
2. Created private GitHub repository `siphned/pb138-project` and added it as `origin`.
3. Pushed all local branches and tags to GitHub over HTTPS (SSH keys for GitHub were not used).
4. Added `.github/workflows/ci.yml` implementing install → lint → typecheck → build → test jobs using Bun.
5. Created GitHub PRs for feature branches and retargeted `feature/docs-*` PRs to base `feature/docs`.
6. Removed local `gitlab` remote to avoid accidental pushes to the old upstream.

Notes & issues encountered
- SSH to `gitlab.fi.muni.cz` failed (permission denied); used HTTPS to push to GitHub instead.
- Two `feature/docs-*` branches had no new commits relative to `feature/docs`, so GitHub refused to retarget their PRs; they should be merged locally into `feature/docs` if needed before closing.

Next steps
- Recreate CI secrets and protected branch rules on GitHub (tokens, registry auth, etc.).
- Confirm the `feature/docs -> dev` PR (#1) and merge flow with the team.
- Replace remaining GitLab repository links in docs (this repo has been updated where possible).
- Keep this log up to date with any further migration steps or issues.

Entries
- 2026-04-12: Migration performed. See Actions performed above.

Maintainer: siphned (repo owner) — update this file when additional migration changes occur.

---

# Development Log — WINE-121: Clerk Auth Frontend Integration & Testing

Date: 2026-04-26

## Summary

Completed the WINE-121 branch: wiring Clerk authentication to the frontend, resolving a cascade of integration issues introduced during prior merges, fixing backend test regressions from WINE-140/WINE-141, and establishing a full unit + E2E test baseline (234 tests passing).

---

## Context

After WINE-58 (auth pages), WINE-59 (dashboard), and subsequent module PRs were merged into `dev`, a number of integration issues were silently introduced:

- `main.tsx` had `ClerkProvider` removed/commented out, breaking auth entirely.
- `.env.local` was malformed (env vars wrapped in markdown code fences), so Vite could not read `VITE_CLERK_PUBLISHABLE_KEY` — Clerk threw "Missing Publishable Key" on every page load.
- `apps/web/src/routes/index.tsx` was replaced with a redirect to `/explore`, removing the homepage.
- `Sidebar.tsx` had broken routes (`/inventory`, `/bundles`, `/logout` pointing to `/dashboard` or `/explore`) and used a non-existent `useSignOut` import.
- `UserContext.tsx` had an `updateUser` return type mismatch (`PutUsersMe200` returned where `UserProfile` was declared).
- The `openapi.json` spec still had `role: {enum: ["user","admin"]}` instead of `roles: string[]`, causing generated Orval types to revert on every `bun run generate`.
- `apps/server/scripts/export-spec.ts` hung indefinitely (server startup never completed), blocking the generate pipeline.

---

## Work Performed

### 1. Fixed `openapi.json` spec (root cause of all type regressions)

The OpenAPI spec at `apps/server/openapi.json` was mutated directly with a Node.js script to replace the stale `role` enum field with `roles: { type: array, items: { type: string } }` in both `GET /users/me` and `PUT /users/me` response schemas, and updated their `required` arrays accordingly. After this, `bun run generate` permanently produces correct types and no manual fixups are needed.

### 2. Restored `main.tsx` (ClerkProvider setup)

Recovered the full WINE-58 provider hierarchy:

```
ClerkProvider → AxiosInterceptor → QueryClientProvider → UserProvider → RouterProvider
```

Also restored the `declare module "@tanstack/react-router"` registration and the publishable key guard (`throw new Error` if env var missing).

### 3. Fixed `.env.local`

Removed markdown code fences that were wrapping the env vars, making the file valid for Vite to parse. The VITE_CLERK_PUBLISHABLE_KEY is now read correctly on startup.

### 4. Restored `routes/index.tsx` homepage

Restored the Wine Enjoyers homepage (heading, subtitle, Header component) that was replaced by a redirect during prior merges.

### 5. Fixed `Sidebar.tsx`

- Shop links (`My Wines`, `Bundles`) now point to `/shops` (not `/dashboard`).
- `Order History` link points to `/orders`.
- Logout changed from `<Link to="/explore">` to a `<button>` calling `useClerk().signOut({ redirectUrl: "/" })`. The `useSignOut` import (which doesn't exist in `@clerk/react`) was removed.

### 6. Fixed `UserContext.tsx`

`updateUser` now explicitly maps the `PutUsersMe200` API response to the internal `UserProfile` shape, resolving the return type mismatch.

### 7. Fixed `export-spec.ts` hanging

Wrapped the spec generation logic in a hard 3-second timeout (`setTimeout` + `process.exit(0)`) so the script always exits, even if the Elysia server startup takes too long. The script now prints a clear message and exits cleanly regardless.

### 8. Added accessibility attribute to auth loading spinner

Added `role="status" aria-label="Loading"` to the spinner div in `_authenticated.tsx` for both accessibility compliance and testability.

### 9. Fixed backend test regressions (WINE-140 / WINE-141 side-effects)

Three test files had failures from Phase 2/3 backend changes that added new service calls not reflected in mocks:

**`orders.service.test.ts`** (3 failures):
- Added `deletedAt: null` to all mock cart item products so the `if (cartItem.product.deletedAt !== null)` guard evaluates correctly (`undefined !== null` is `true` in JS, causing false PRODUCT_DELETED errors).

**`users.service.test.ts`** (2 failures):
- Added `vi.mock("./user-roles.repository")` mock for `findByUserId`, `addRole`, and `removeRole` — the `syncRolesToDatabase` call added in Phase 2 was hitting the real DB in tests.

**`carts.service.test.ts`** (3 failures):
- Added `vi.mock("../products/products.repository")` mock for `isDeleted` (returning `false`) — the Phase 3 deletion check in `addItem` was hitting the real DB.

**`carts.routes.test.ts`** and **`orders.routes.test.ts`** (2 failures):
- Mock return values were minimal objects (`{ id: "c1", items: [] }`), but Elysia validates responses against strict TypeBox schemas and returns 422 on mismatch. Updated mocks to return fully-shaped objects matching `cartResponse` and `orderResponse` schemas respectively. Used `vi.hoisted()` for values referenced inside `vi.mock()` factory functions.

### 10. Established test baseline

**Unit tests (Vitest + React Testing Library):**

| File | Tests | What is covered |
|------|-------|----------------|
| `AuthenticatedLayout.test.tsx` | 6 | Spinner while loading, outlet when signed in, null when not signed in, redirects to /login, no redirect while loading, no redirect when signed in |
| `UserContext.test.tsx` | 6 | Loading state, no user, user data with roles, roles default to `[]`, `updateUser` calls mutateAsync, `updateUser` returns `UserProfile` shape |
| `Sidebar.test.tsx` | 6 | Log out button visible, signOut called with redirect, Order History for customer role, My Wines/Bundles for non-customer, shop links point to `/shops`, logout is a button not a link |

New test infrastructure:
- `apps/web/vitest.config.ts` — jsdom environment, `@` and `@repo/shared` path aliases, excludes e2e directory
- `apps/web/playwright.config.ts` — chromium, auto-starts dev server on port 5173, e2e test dir
- `apps/web/src/__tests__/setup.ts` — imports `@testing-library/jest-dom`

**E2E tests (Playwright):**

| File | Tests | What is covered |
|------|-------|----------------|
| `auth.spec.ts` | 10 | Auth guards redirect /dashboard, /settings, /orders, /admin to /login; homepage/explore/login/register accessible without auth; no Clerk key error |
| `routing.spec.ts` | 3 | Homepage heading visible, /explore renders, unknown routes don't crash |

**Final counts:**
- Server unit tests: 212 passed, 0 failed (30 test files)
- Web unit tests: 22 passed, 0 failed (5 test files — includes pre-existing useRoles test)
- E2E tests: 13 passed, 0 failed

---

## Files Changed

### New files
- `apps/web/vitest.config.ts`
- `apps/web/playwright.config.ts`
- `apps/web/src/__tests__/setup.ts`
- `apps/web/src/__tests__/AuthenticatedLayout.test.tsx`
- `apps/web/src/__tests__/UserContext.test.tsx`
- `apps/web/src/__tests__/Sidebar.test.tsx`
- `apps/web/src/__tests__/e2e/auth.spec.ts`
- `apps/web/src/__tests__/e2e/routing.spec.ts`

### Modified files
- `apps/server/openapi.json` — replaced `role` enum with `roles` array in response schemas
- `apps/server/scripts/export-spec.ts` — hard timeout + guaranteed process.exit
- `apps/server/src/modules/orders/orders.service.test.ts` — added `deletedAt: null` to mock products
- `apps/server/src/modules/users/users.service.test.ts` — added `user-roles.repository` mock
- `apps/server/src/modules/carts/carts.service.test.ts` — added `products.repository` mock
- `apps/server/src/modules/carts/carts.routes.test.ts` — full `cartResponse`-shaped mock + `vi.hoisted`
- `apps/server/src/modules/orders/orders.routes.test.ts` — full `orderResponse`-shaped mock + `vi.hoisted`
- `apps/web/.env.local` — removed markdown fences, now valid key=value format
- `apps/web/src/main.tsx` — restored full ClerkProvider + RouterProvider setup
- `apps/web/src/routes/index.tsx` — restored Wine Enjoyers homepage
- `apps/web/src/routes/_authenticated.tsx` — added `role="status" aria-label="Loading"` to spinner
- `apps/web/src/components/layout/Sidebar.tsx` — fixed routes, fixed logout (button + useClerk)
- `apps/web/src/context/UserContext.tsx` — fixed `updateUser` return type mapping

---

## Issues & Lessons

- **`undefined !== null` is `true` in JS.** When mock objects omit optional fields, they are `undefined`, not `null`. Code that checks `x !== null` will treat `undefined` as a truthy mismatch. Always include `field: null` explicitly in test fixtures for nullable DB columns.
- **Elysia validates response bodies** against TypeBox schemas before sending. If a mock returns a partial object, the route returns 422 instead of 200. Route-level integration tests must return fully-shaped mock responses.
- **`vi.mock()` factory functions are hoisted** before variable declarations. Objects referenced inside `vi.mock(...)` must be defined via `vi.hoisted()` or the factory will throw "Cannot access before initialization".
- **Stale OpenAPI spec = permanent type debt.** The spec is the single source of truth for Orval code generation. Any manual type fix to generated files is overwritten on the next `bun run generate`. Always fix the spec first.

---

## Next Steps

- Rebase `WINE-121` on latest `dev` and resolve any conflicts from WINE-63/64/66 merges.
- Verify build + type check pass post-rebase.
- Open PR/MR: `[WINE-121] Wire Clerk auth to frontend, fix integration issues, add test baseline`.
- Unblock WINE-65 (cart/orders), WINE-67 (reviews), WINE-79 (admin) — these branches can be rebased on dev once WINE-121 merges.

---

Maintainer: Matěj Šinogl
