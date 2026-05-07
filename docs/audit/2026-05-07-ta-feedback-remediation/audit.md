# Audit — TA Feedback Remediation (2026-05-07)

## Meta
- **Date:** 2026-05-07
- **Auditor:** Matěj Šinogl (with AI assist)
- **Scope:** All ⚠️ Concerns from TA review dated 2026-04-30 (`docs/TA_feedback`) — Component Library, Styling, Environment Variables, Logging & Monitoring, Security. Excludes ✅ Good categories and deferred stretch recommendations.
- **Branch:** `fix/WINE-150-ta-review-remediation` (10 commits ahead of `dev`)
- **Status:** OPEN

---

## Summary

Branch `fix/WINE-150-ta-review-remediation` closes the majority of TA ⚠️ concerns. All styling issues in `MyWines.tsx` (hex colors, ad-hoc font sizes, 648-line file) are fully resolved. All raw `<button>` usages flagged in Component Library are replaced. Database misconfiguration now fails fast. `.gitignore` hardened. Two items remain open: `packages/ui` is still present and unused (TA §1.2 / §10.2), and structured logging (pino) was not added (TA §10.1). The `handleError` adoption in `wines.routes.ts` and `role-requests.routes.ts` was attempted but is blocked by an Elysia framework constraint — documented in D-01.

---

## Findings

### F-01: Raw `<button>` in Feature Components

- **Area:** frontend
- **Severity:** minor
- **Status:** ✅ resolved
- **Current state:** All flagged usages replaced with `<Button variant="ghost">` or `<Button variant="link">` from `@/components/ui/button`:
  - `Sidebar.tsx` — 4 instances (role switcher, Settings, Theme, Log out)
  - `FilterSidebar.tsx` — star rating filter row
  - `WineCard.tsx` — wishlist button
  - `ShopGalleryThumbnailStrip.tsx` — gallery thumbnail
  - `winemakers.$id.tsx` — retry button
- **Expected state:** All interactive elements use shared `Button` component for consistent focus rings, disabled handling, styling.
- **Divergence:** None remaining.
- **Decision:** D-02
- **Action items:** None.

---

### F-02: `packages/ui` Unused Package Not Deleted

- **Area:** toolchain
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** `packages/ui/src/button.tsx` still exists. The starter `console.log` was removed (✅), but the package itself remains. The project uses `apps/web/src/components/ui/button.tsx` exclusively. `packages/ui` exports `Button`, `Card`, `Code` — none consumed anywhere in the app.
- **Expected state:** TA §1.2 + §10.2 — "Either delete `packages/ui` or document its purpose."
- **Divergence:** The console.log cleanup was done but the delete decision was deferred.
- **Decision:** Pending — see D-03.
- **Action items:**
  - [ ] Team decision: delete `packages/ui` entirely, or keep with a documented purpose (e.g., future shared component library for multi-app monorepo)
  - [ ] If deleting: remove the workspace entry from root `package.json`, remove `@repo/ui` from any `package.json` `dependencies`, delete the folder

---

### F-03: Hex Status Colors and Ad-hoc Font Sizes in MyWines.tsx

- **Area:** frontend
- **Severity:** minor
- **Status:** ✅ resolved
- **Current state:**
  - All `bg-[#E8F5E9]`, `text-[#2E7D32]`, etc. replaced with `<Badge variant={statusVariant(x.status)}>`.
  - New `success` / `warning` / `danger` / `info` variants added to `badge.tsx` using Tailwind semantic classes.
  - `statusVariant()` extracted to `apps/web/src/components/dashboard/statusVariant.ts`.
  - All `text-[15px]` → `text-sm`, `text-[10px]` removed (Badge base already applies `text-xs`).
- **Expected state:** Status colors via Badge variants; font sizes from Tailwind scale.
- **Divergence:** None remaining.
- **Action items:** None.

---

### F-04: MyWines.tsx Over 250-Line Guideline

- **Area:** frontend
- **Severity:** minor
- **Status:** ✅ resolved
- **Current state:** `MyWines.tsx` reduced from 648 → 72 lines. Five tab files extracted:
  - `WinemakerInventoryTab.tsx`
  - `ShopOwnerInventoryTab.tsx`
  - `CustomerOrderHistoryTab.tsx`
  - `BundlesListTab.tsx`
  - `EventsListTab.tsx`
- **Expected state:** Component files under ~250 lines per project convention.
- **Divergence:** None remaining.
- **Action items:** None.

---

### F-05: DATABASE_URL Misconfiguration Silently Masked

- **Area:** backend
- **Severity:** major
- **Status:** ✅ resolved
- **Current state:** `apps/server/src/db/index.ts` now throws `Error("DATABASE_URL is required...")` when env var is missing outside `NODE_ENV=test`. Fallback string `"postgres://localhost/placeholder"` and `console.warn` removed.
- **Expected state:** TA §4.3 — fail fast on misconfiguration, do not fall back to a placeholder.
- **Divergence:** None remaining.
- **Action items:** None.

---

### F-06: Hardcoded CORS Origin and OpenAPI Server URL

- **Area:** backend
- **Severity:** major
- **Status:** ✅ resolved (pre-existing fix confirmed)
- **Current state:** `apps/server/src/app.ts` already uses `process.env.FRONTEND_URL ?? "http://localhost:5173"` for CORS and `process.env.API_URL ?? "http://localhost:3000"` for OpenAPI server URL. Both documented in `apps/server/.env.example`.
- **Expected state:** TA §4.1 + §4.2 + §12.1 — env-var-driven, not hardcoded.
- **Divergence:** TA review was based on an older snapshot; this was already fixed on `dev` before this branch.
- **Action items:** None.

---

### F-07: .gitignore Missing Credential File Patterns

- **Area:** toolchain / security
- **Severity:** minor
- **Status:** ✅ resolved
- **Current state:** `.gitignore` now includes `*.key`, `*.crt`, `secrets/`, `credentials*.json` (added alongside existing `*.pem`).
- **Expected state:** TA §12.2 — explicit patterns for common credential file types.
- **Divergence:** None remaining.
- **Action items:** None.

---

### F-08: `handleError` Not Adopted in wines.routes.ts and role-requests.routes.ts

- **Area:** backend
- **Severity:** minor
- **Status:** 🔄 in progress (blocked — see D-01)
- **Current state:** Both `wines.routes.ts` and `role-requests.routes.ts` still use inline `if (e.message === "NOT_FOUND") return status(404, ...)` blocks. Two new error codes (`ALREADY_HAS_PENDING_REQUEST`, `ALREADY_RESPONDED`) were added to `errors.ts` ✅ but the routes call them inline rather than via `handleError`.
- **Expected state:** TA §7.1 + §11.1 — use `handleError(e)` from `utils/errors.ts` as used in `products.routes.ts`.
- **Divergence:** Elysia narrows the handler return type when `response:` schema is declared on a route. Returning `ElysiaCustomStatusResponse<...>` from an extracted function produces a TypeScript error because the union type is broader than the declared schema. `products.routes.ts` avoids this by omitting `response:` declarations from handlers that call `handleError` — trading OpenAPI response documentation for the helper. The trade-off was judged not worth making in wines/role-requests without a broader team decision on whether to drop `response:` declarations.
- **Decision:** D-01
- **Action items:**
  - [ ] Team decides: drop `response:` declarations from `wines.routes.ts` to unlock `handleError` adoption (same as `products.routes.ts` pattern), or keep response docs and live with inline error handling
  - [ ] If dropping: replace inline blocks with `handleError(e)` in `GET /wines/:id`, `POST /wines`, `PUT /wines/:id`, `DELETE /wines/:id`
  - [ ] Same decision for `PATCH /role-requests/:id/approve` and `PATCH /role-requests/:id/reject`

---

### F-09: No Structured Logger (pino)

- **Area:** backend
- **Severity:** info
- **Status:** ❌ open
- **Current state:** All server logging uses `console.log/warn/error`. No level-based filtering, no JSON output, no correlation IDs. TA noted this is acceptable for a course project but recommended `pino`.
- **Expected state:** TA §10.1 — structured logger wired into `app.ts:onError` and `index.ts` startup banners.
- **Divergence:** Not addressed on this branch. Low priority for Milestone 3 but recommended before any production-facing demo.
- **Decision:** Deferred to post-Milestone 3 polish or separate task.
- **Action items:**
  - [ ] `bun add pino pino-pretty` in `apps/server`
  - [ ] Create `apps/server/src/utils/logger.ts` (singleton pino instance)
  - [ ] Replace `console.error` in `app.ts:onError` with `logger.error({ method, url, status, stack }, "Request error")`
  - [ ] Replace startup `console.log` in `index.ts:4-6` with `logger.info({ port, swagger }, "Server started")`

---

### F-10: No React ErrorBoundary in main.tsx

- **Area:** frontend
- **Severity:** info
- **Status:** ❌ open
- **Current state:** `apps/web/src/main.tsx` has no `<ErrorBoundary>` wrapper. Unhandled render errors propagate to a blank white screen.
- **Expected state:** TA §11.2 — top-level ErrorBoundary for unhandled component throws.
- **Divergence:** Not addressed on this branch. Data-fetch errors are handled via `isError` + `refetch` patterns throughout; only synchronous render errors are unprotected.
- **Decision:** Deferred. Acceptable for Milestone 2 evaluation; should be done before Milestone 3.
- **Action items:**
  - [ ] Create `apps/web/src/components/AppErrorBoundary.tsx` (class component implementing `componentDidCatch`)
  - [ ] Wrap `<RouterProvider>` in `main.tsx` with `<AppErrorBoundary fallback={<p>Something went wrong.</p>}>`

---

### F-11: Placeholder Tests Deleted

- **Area:** toolchain / testing
- **Severity:** info
- **Status:** ✅ resolved
- **Current state:** `apps/server/src/__tests__/placeholder.test.ts` and `apps/web/src/__tests__/placeholder.test.ts` both deleted.
- **Expected state:** TA §9.1 — delete now that real tests exist.
- **Divergence:** None remaining.
- **Action items:** None.

---

### F-12: Nominatim Geocode Fetch Not Using useQuery

- **Area:** frontend
- **Severity:** info
- **Status:** ✅ resolved
- **Current state:** `ShopMapEmbed.tsx` now uses `useQuery({ queryKey: ["osm-geocode", query], queryFn: geocode, retry: false })`. `useEffect` + manual `AbortController` removed.
- **Expected state:** TA §3.1 — wrap in `useQuery` for deduplication and caching.
- **Divergence:** None remaining. Note: `retry: false` means one Nominatim failure = permanent error for that page load. Consider `retry: 1` if Nominatim flakiness becomes an issue.
- **Action items:** None mandatory. Optional: change `retry: false` → `retry: 1`.

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | Do not adopt `handleError` in `wines.routes.ts` / `role-requests.routes.ts` on this branch | Elysia narrows handler return types when `response:` schema is declared; calling `handleError` (which returns a broad union) breaks TypeScript compilation. `products.routes.ts` works because it omits `response:` declarations. Changing wines/role-requests would drop OpenAPI response documentation. Team must decide the trade-off. | 🔄 pending team discussion |
| D-02 | Replace all raw `<button>` with `<Button variant="ghost">` using custom `className` overrides | Preserves visual appearance while gaining consistent focus rings, `disabled` prop handling, and `aria-disabled` semantics from the shared primitive. `asChild` not needed — no polymorphic element change required. | ✅ done |
| D-03 | `packages/ui` — decision deferred | Package is unused. Deleting it removes a potential confusion point. Keeping it could make sense if the team later wants a shared cross-app design system. No consumer of `@repo/ui` exists today. | 🔄 pending team discussion |

---

## Outstanding Work

Ordered by priority:

1. **Team discuss D-01** — adopt `handleError` in `wines.routes.ts` + `role-requests.routes.ts` (drop `response:` declarations, or accept inline pattern). Close F-08.
2. **Team discuss D-03** — delete `packages/ui` or document purpose. Close F-02.
3. **Add React ErrorBoundary** in `main.tsx` before Milestone 3. Close F-10.
4. **Add pino structured logger** — deferred post-Milestone 3, but wire into `onError` before any live demo. Close F-09.
5. *(Optional)* Change `ShopMapEmbed` `retry: false` → `retry: 1` for Nominatim resilience. Close F-12 note.
