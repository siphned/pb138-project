# WINE-121 Status

**Date:** 2026-04-26
**Branch:** WINE-121-wire-clerk-auth-to-frontend
**Status:** Ready for PR — all tests green

---

## What's Done

- Clerk auth fully wired to frontend (ClerkProvider, AxiosInterceptor, UserProvider, RouterProvider)
- `.env.local` fixed (was malformed with markdown fences — Vite couldn't read env vars)
- Homepage restored (was replaced by redirect during prior merges)
- Sidebar logout fixed (`useClerk().signOut` button, not a broken Link)
- Sidebar routes fixed (`/shops` for winemaker links, `/orders` for customer)
- `UserContext.updateUser` return type fixed (now properly maps to `UserProfile`)
- `openapi.json` spec fixed (`role` enum → `roles: string[]`) — Orval now generates correct types permanently
- `export-spec.ts` fixed (hard 3-second timeout, always exits)
- Auth guard (`_authenticated.tsx`) confirmed working — unauthenticated users redirected to `/login`

## Test Status

| Suite | Passed | Failed |
|-------|--------|--------|
| Server unit (Vitest) | 212 | 0 |
| Web unit (Vitest + RTL) | 22 | 0 |
| E2E (Playwright) | 13 | 0 |
| **Total** | **247** | **0** |

Backend test regressions from WINE-140/141 resolved:
- `orders.service.test.ts` — mock products now include `deletedAt: null`
- `users.service.test.ts` — `user-roles.repository` mocked
- `carts.service.test.ts` — `products.repository.isDeleted` mocked
- `carts.routes.test.ts` / `orders.routes.test.ts` — full schema-shaped mocks + `vi.hoisted`

## Before Merging to DEV

1. Rebase on latest `dev`:
   ```bash
   git fetch origin dev
   git rebase origin/dev
   git push -f origin WINE-121-wire-clerk-auth-to-frontend
   ```
2. Verify build + type check post-rebase:
   ```bash
   bun run build
   bun run check-types
   bun run check
   bun run test
   ```
3. Create PR: `[WINE-121] Wire Clerk auth to frontend, fix integration issues, add test baseline`

## Commits on Branch (ahead of dev)

```
53b2a79 test: add RTL unit tests and Playwright E2E tests
19ba281 fix: properly wire auth, fix types, fix Sidebar logout
bf09858 fix: correct .env.local formatting and add Clerk debug logging
bb30907 feat: restore WINE-58 auth integration and fix frontend setup
a0a11d7 fix: remove unused import in orders.service.ts
873f88e feat(WINE-141): prevent deleted products in carts and during checkout
7807740 feat(WINE-140): implement multi-role user system with role junction table
```
