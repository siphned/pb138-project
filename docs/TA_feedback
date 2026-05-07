# Project Review: winery (WineMarket)

**Date:** 2026-04-30

---

## Project Orientation

WineMarket is a multi-vendor wine marketplace built as a Bun + Turborepo monorepo for a PB138 university course. The repo is split into `apps/web` (React 19 + Vite + TanStack Router/Query, Tailwind v4, shadcn/ui on top of `@base-ui/react`, Clerk for auth) and `apps/server` (Elysia + Drizzle ORM + PostgreSQL + Clerk backend SDK + Resend), with `packages/shared` exporting the canonical Drizzle schemas (37 tables across 17 files) plus Zod schemas to both sides. The frontend consumes the backend via a Kubb-generated client (`apps/web/src/generated/`, gitignored — regenerated from `openapi.json` via `bun run generate`).

The server uses a strict modular monolith with `routes / service / repository / schema` per module across 16 modules (admin, auth, availability, carts, email, events, guest-sessions, orders, products, reviews, role-requests, shops, supply-agreements, users, winemakers, wines). Tooling: Biome (lint+format), Vitest (unit), Playwright (E2E), Drizzle Kit (2 migrations applied), Docker Compose for Postgres. Notable observations: extensive OpenAPI metadata on every Elysia route, RBAC implemented as Elysia macros (`requireAuth`, `requireRoles`), and a centralized error helper in `apps/server/src/utils/errors.ts`.

---

## Review Summary

| Category              | Status        |
| --------------------- | ------------- |
| Component Library     | ⚠️ Concerns   |
| Styling               | ⚠️ Concerns   |
| Loading Data          | ✅ Good       |
| Environment Variables | ⚠️ Concerns   |
| REST API Design       | ✅ Good       |
| Database              | ✅ Good       |
| BE Design Patterns    | ✅ Good       |
| Auth                  | ✅ Good       |
| Testing               | ✅ Good       |
| Logging & Monitoring  | ⚠️ Concerns   |
| Error Handling        | ✅ Good       |
| Security              | ⚠️ Concerns   |

Status legend: ✅ Good | ⚠️ Concerns | ❌ Issues | N/A

---

## Detailed Review

### 1. Component Library

**Status:** ⚠️ Concerns

A real component library is in place: `@base-ui/react ^1.4.0` plus the `shadcn` CLI, with proper wrapper primitives in `apps/web/src/components/ui/` (button, input, select, dialog, sheet, slider, tabs, dropdown-menu, accordion, avatar, badge, checkbox, separator, textarea — all wrapping Base UI primitives). There is also a small `packages/ui/` workspace with `button.tsx`, `card.tsx`, `code.tsx`. The library is consistently imported across routes via `@/components/ui/...`.

However, raw `<button>` elements are used in feature code in places where the shared `Button` should be used:

- `apps/web/src/components/layout/Sidebar.tsx:117`, `:181`, `:193`, `:202` — four raw `<button>` elements.
- `apps/web/src/components/catalog/FilterSidebar.tsx:159`.
- `apps/web/src/routes/-components/WineCard.tsx:66`.
- `apps/web/src/routes/-components/ShopGalleryThumbnailStrip.tsx:17`.
- `apps/web/src/routes/winemakers.$id.tsx:39`.

(Raw `<button>` and `<textarea>` inside `apps/web/src/components/ui/*.tsx` and inside test files are expected — they are the primitives themselves or test fixtures.)

**Recommendations:**

1. Replace the raw `<button>` usages above with the wrapper from `@/components/ui/button` (or use `asChild` if a different element is needed) so styling, focus rings, and disabled handling stay consistent.
2. Decide whether the starter `packages/ui/src/button.tsx` is still needed — the project uses `apps/web/src/components/ui/button.tsx` exclusively. Either delete `packages/ui` or document its purpose. See item 10.2.

---

### 2. Styling

**Status:** ⚠️ Concerns

Tailwind v4 is used everywhere; only two CSS files exist (`apps/web/src/App.css`, `apps/web/src/index.css`). No inline `style={{...}}` attributes were found in source code, and `!important` is not abused. The shadcn/Base UI primitives use Tailwind arbitrary values (`focus-visible:ring-[3px]`, `rounded-[6px]`) — these are necessary inside primitives and are fine.

The clear smell is in `apps/web/src/components/dashboard/MyWines.tsx` (648 lines, far over the ~250-line guideline for component files) where status colors are pasted as raw hex literals across many lines:

- Line 111, 119, 127, 135, 340, 349, 445, 548, 557 — `bg-[#E8F5E9]`, `text-[#2E7D32]`, `bg-[#FFF3E0]`, `bg-[#FFEBEE]`, `bg-[#E3F2FD]`, `text-[#1976D2]` etc.
- Repeated `text-[15px]`, `text-[10px]` ad-hoc font-size values (lines 217, 222, 319, 419, 426, 431, 521, 526, 627).

This bypasses the design tokens defined in `index.css` and makes theme/dark-mode work harder.

**Recommendations:**

1. Promote the status-color combinations (success / warning / danger / info) into Tailwind theme tokens or component variants on `<Badge>` (`variant="success" | "warning" | ...`) and replace the hex arbitrary classes in `MyWines.tsx`.
2. Replace ad-hoc `text-[15px]` / `text-[10px]` with the existing scale (`text-sm`, `text-xs`) or extend the theme if a new size is genuinely needed.
3. Split `MyWines.tsx` (currently 648 lines) into per-tab sub-components (`MyWinesTab`, `MyOrdersTab`, `MyBundlesTab`, `MyEventsTab`) — the file is the largest in `apps/web/src/components/dashboard/` by an order of magnitude.

---

### 3. Loading Data

**Status:** ✅ Good

TanStack Query is configured in `apps/web/src/main.tsx:10` with a single `QueryClient` wrapped around the app. All data access goes through Kubb-generated hooks under `@/generated/hooks/...` — examples:

- `apps/web/src/routes/products.$productId.tsx:6-7` (`useGetProductsById`, `useGetReviewsProductById`).
- `apps/web/src/routes/shops.index.tsx:9` (`useGetShops`).
- `apps/web/src/routes/shops.$id.tsx:7` (`useGetShopsById`).
- `apps/web/src/routes/-components/ProductPriceRow.tsx:5` (`usePostCartsItems` mutation).
- `apps/web/src/context/UserContext.tsx:4` uses `getUsersMeQueryKey()` + `getUsersMeQueryOptions()` and invalidates with `queryClient.invalidateQueries({ queryKey: getUsersMeQueryKey() })` — correct stable-key pattern.

The only direct `fetch` in components is `apps/web/src/routes/-components/ShopMapEmbed.tsx:23` calling Nominatim for geocoding. It is correctly aborted via `AbortController` in `useEffect` and is acceptable for a one-off third-party call, though it could still be wrapped in `useQuery` for caching/retry semantics.

**Recommendations:**

1. Optionally migrate the Nominatim call in `ShopMapEmbed.tsx` to `useQuery({ queryKey: ['osm-geocode', query], queryFn: ... })` — gets you free deduplication and a single in-memory cache when multiple shops on a page geocode the same address.

---

### 4. Environment Variables

**Status:** ⚠️ Concerns

`.gitignore` covers `.env`, `.env.local`, and the per-environment variants (root `.gitignore`). Three template files exist: `.env.example`, `apps/web/.env.example`, `apps/server/.env.example`, all with placeholder values. Env access goes through `import.meta.env.VITE_*` on the web side and `process.env.*` on the server, and `apps/web/src/main.tsx:19` reads `VITE_CLERK_PUBLISHABLE_KEY` correctly.

Hardcoded values that belong in env vars:

- `apps/server/src/app.ts:25` — `cors({ origin: "http://localhost:5173" })` is hardcoded; this will block the deployed frontend.
- `apps/server/src/app.ts:44` — OpenAPI `servers: [{ description: "Development", url: "http://localhost:3000" }]` is hardcoded.
- `apps/web/src/lib/axios.ts:35` and `apps/web/src/constants/api.ts:2` — `import.meta.env.VITE_API_URL || "http://localhost:3000"` is fine as a dev fallback but should be removed in prod builds (or fail loudly if missing in production mode).
- `apps/server/src/db/index.ts:11` — `connectionString: process.env.DATABASE_URL || "postgres://localhost/placeholder"` — the placeholder is misleading; combined with the `console.warn` on line 7, prefer a hard `throw` outside test mode so misconfiguration fails fast.
- `apps/server/src/index.ts:4-6` — startup `console.log` of hardcoded URLs (cosmetic; flagged again under §10).

**Recommendations:**

1. Read `FRONTEND_URL` from `process.env` in `apps/server/src/app.ts:25` and pass it to `cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" })`. The variable is already documented in `apps/server/.env.example`.
2. Replace the hardcoded OpenAPI server URL in `apps/server/src/app.ts:44` with `process.env.API_PUBLIC_URL ?? "http://localhost:3000"`.
3. In `apps/server/src/db/index.ts`, throw (don't fall back) when `DATABASE_URL` is missing in production. The current placeholder string can mask configuration errors.

---

### 5. REST API Design

**Status:** ✅ Good

Routes are resource-oriented and idiomatic across all 16 modules. Sample evidence from `apps/server/src/modules/wines/wines.routes.ts`:

- `GET /wines`, `GET /wines/:id`, `POST /wines`, `PUT /wines/:id`, `DELETE /wines/:id` — correct verb/noun pairings.
- 201 on create (`status(201, ...)`), 204 on delete, 403/404 for ownership/missing resources.
- Every route declares `body`, `params`, `query`, and `response` schemas via TypeBox (`t.Object`, `t.Array(...)`) and a full `detail` block (description, summary, tags, security) feeding the OpenAPI spec.

A scan for verb-in-path anti-patterns (`/getX`, `/createY`, `/doZ`) returned zero matches in route files. Hierarchical resources are correctly nested: `/shops/:id/products`, `/shops/me`, `/reviews/product/:id`, `/admin/...`. Validation schemas are extensive — `packages/shared/src/schemas` has 159 `z.object`/`z.string`/`z.number`/`z.uuid` definitions plus per-module TypeBox schemas in `apps/server/src/modules/*/*.schema.ts`.

**Recommendations:**

1. Consider documenting the "module → endpoint" mapping in `docs/API/` (you already have the folder) so contributors don't need to grep `.routes.ts` files. A one-page table of every endpoint + verb + auth requirement would also make the role/permission matrix easier to verify.

---

### 6. Database

**Status:** ✅ Good

Schema is sourced from `packages/shared/src/schemas/` (re-exported by `apps/server/src/db/schema/index.ts`) with 37 `pgTable` definitions split across cleanly named files (addresses, availability, carts, catalog, events, guest-sessions, images, orders, reviews, role-requests, sellers, supply-agreements, users) plus a dedicated `relations.ts` (186 lines). 78 `.references(`/`references:` declarations confirm foreign keys are wired everywhere; 66 `uuid(...)` columns confirm a consistent UUID PK strategy.

Migrations are managed by Drizzle Kit (`apps/server/src/db/migrations/0000_messy_black_tom.sql`, `0001_quick_clint_barton.sql`, plus `meta/_journal.json`) — versioned, not a single-file dump. No `bytea` / `blob` / `base64` / `imageData` columns — images are referenced as URLs via `images.ts`.

Raw SQL appears only in safe, parameterized contexts using Drizzle's `sql` template tag (e.g., `apps/server/src/modules/products/products.repository.ts:126` `quantity: sql\`${wines.quantity} - ${total}\`` — this is parameterized, not string concatenation). The same pattern is used to express `EXISTS` subqueries and aggregate filters (`AVG(${reviews.rating}) >= ${filters.rating}`), which is the correct way to extend Drizzle.

The `db:check` task runs in CI (`apps/server/package.json:db:check` → `drizzle-kit check`), and `validate` script in root `package.json` enforces schema/migration consistency.

**Recommendations:**

1. `apps/server/src/modules/products/products.repository.ts` is 638 lines — the largest single file in the backend. Consider extracting bundle/stock-allocation helpers into a dedicated `products.stock.ts` or `bundles.repository.ts` file. The atomic stock allocation logic (lines 126-234, 466-521) is non-trivial and would benefit from isolation + targeted tests.

---

### 7. Backend Design Patterns

**Status:** ✅ Good

Every feature module ships the four-layer pattern from `.claude/CLAUDE.md`:

```
apps/server/src/modules/<module>/
  <module>.routes.ts       # HTTP, status codes
  <module>.service.ts      # business logic
  <module>.repository.ts   # DB queries
  <module>.schema.ts       # TypeBox/Zod
```

A spot-check on every `*.routes.ts` shows imports only from `./<module>.schema`, `./<module>.service`, and the auth plugin — no DB imports leak into the HTTP layer. File sizes are all well within guidance:

- Routes: 73 - 234 lines (all under the 250-line soft cap).
- Services: 83 - 205 lines (`products.service.ts` = 205, `orders.service.ts` = 202, `events.service.ts` = 200 — at the upper end but justifiable given complexity).
- Repositories: 97 - 313 lines, with the outlier `products.repository.ts` at 638 (see §6).

Cross-cutting concerns are factored properly: `apps/server/src/utils/errors.ts` centralizes `NOT_FOUND → 404`, `FORBIDDEN → 403`, `EMPTY_CART → 400`, `INSUFFICIENT_STOCK → 400`, `STATUS_CHANGE_INVALID → 409`, used as `handleError(e)` from `products.routes.ts:58, :90, :108, :130, :153, :176, :198, :221`.

**Recommendations:**

1. Adopt the `handleError(e)` helper from `apps/server/src/utils/errors.ts` in the `wines.routes.ts` and `role-requests.routes.ts` handlers (which currently inline `if (e.message === "NOT_FOUND") ...`). It will shrink those routes by ~20 lines each and make new error codes one-place additions.

---

### 8. Auth

**Status:** ✅ Good

Authentication is delegated to Clerk on both sides:

- `apps/server/package.json` → `@clerk/backend ^3.2.12`.
- `apps/web/package.json` → `@clerk/react ^6.4.5`.
- Root `package.json` → `@clerk/tanstack-react-start ^1.1.5`.

No `jsonwebtoken`, `bcrypt`, or `crypto.createHash` calls — no hand-rolled JWT/password handling. Token verification is centralized in `apps/server/src/modules/auth/auth.utils.ts` (uses `process.env.CLERK_JWT_KEY`).

Authorization (not just authentication) is enforced via Elysia macros in `apps/server/src/modules/auth/auth.plugin.ts`:

- `requireAuth: { ... if (!hasCapability) return status(403); }` (line 10, 37).
- `requireRoles(roles: AppRole[])` (line 55, 61) — used as e.g. `requireRoles: ["winemaker"]`, `requireRoles: ["winemaker", "admin"]`, `requireRoles: ["shop_owner"]`, `requireRoles: ["admin"]` across `wines`, `products`, `role-requests`, `admin`.

Ownership checks are present in services, not just role gates — examples:

- `apps/server/src/modules/wines/wines.service.ts:28` and `:55` — `if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN")`.
- `apps/server/src/modules/products/products.service.ts:41` — `if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN")`.
- `apps/server/src/modules/orders/orders.service.ts:128` — `if (order.userId !== userId) throw new Error("FORBIDDEN")`.
- `apps/server/src/modules/supply-agreements/supply-agreements.service.ts:64` — winemaker ownership check.

**Recommendations:**

1. None required. As a future improvement, write a dedicated `auth.plugin.test.ts` that asserts the macro returns 401/403 for the negative paths (currently exercised indirectly through `*.routes.test.ts`).

---

### 9. Testing

**Status:** ✅ Good

The repo has 33 backend test files covering every module's repository, service, and (for several) routes:

- Server: `admin`, `availability`, `carts`, `events`, `guest-sessions`, `orders`, `products`, `reviews`, `role-requests`, `shops`, `supply-agreements`, `users`, `winemakers`, `wines` — each with one or more `*.test.ts`. Plus `apps/server/src/utils/pagination.test.ts`.
- Frontend: `AuthenticatedLayout.test.tsx`, `DashboardTabs.test.tsx`, `ProfileEditForm.test.tsx`, `Sidebar.test.tsx`, `UserContext.test.tsx`, `UserInfoCard.test.tsx`, `useRoles.test.ts`, `utils.test.ts`.
- E2E (Playwright): `apps/web/src/__tests__/e2e/auth.spec.ts` (auth guards, public routes, env), `routing.spec.ts`.

Test runners are configured: `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts`, server uses Bun's Vitest runner. No `.skip`, `.todo`, `xit`, or `xdescribe` calls anywhere in the test files.

The two `placeholder.test.ts` files (`apps/server/src/__tests__/placeholder.test.ts`, `apps/web/src/__tests__/placeholder.test.ts`) contain only `expect(true).toBe(true)` — these were CI-green stubs from project bootstrap and now have many real tests beside them.

**Recommendations:**

1. Delete both `placeholder.test.ts` files now that real tests exist — they add noise to test runs and CI logs.
2. Frontend coverage is thinner than backend (8 unit tests vs 33). As Milestone 3 approaches, prioritize component tests for `WineCatalog.tsx`, `MyWines.tsx`, and the cart/checkout flow — these contain the most behavior.

---

### 10. Logging & Monitoring

**Status:** ⚠️ Concerns

No structured logging library in dependencies — a grep for `pino`, `winston`, `consola`, `@logtail`, `pino-http`, `loglevel` across all `package.json` files returned zero hits. All logging is `console.log/warn/error`, which is acceptable for a course project but means there's no level-based filtering, no JSON output, and no correlation IDs for traceability.

Non-test `console` usage:

- `apps/server/src/index.ts:4` and `:6` — startup banners (annotated with `biome-ignore lint/suspicious/noConsole: entry point`). Acceptable but should ideally be `logger.info(...)`.
- `apps/server/src/app.ts:22` — global Elysia `onError` handler logs every request error with `console.error` (annotated as global error handler). Functional, but losing structure.
- `apps/server/src/db/index.ts:7` — `console.warn("⚠️ DATABASE_URL is not set...")` — should `throw` outside test mode (see §4.3).
- `apps/server/scripts/export-spec.ts:51` — script-side logging, fine.
- `apps/server/src/db/seed.ts:229` — `main().catch(console.error)`, fine for a CLI seeder.
- **`packages/ui/src/button.tsx:16`** — `onClick={() => console.log(\`Hello from your ${appName} app!\`)}`. This is the Turborepo starter template that was never deleted; the comment even says "intentional for the starter template." It is unused (the project uses `apps/web/src/components/ui/button.tsx` instead) and it is shipped to any consumer of `@repo/ui`.

No sensitive data (passwords, tokens, secrets) is logged anywhere — that scan returned zero hits.

**Recommendations:**

1. Add a structured logger. `pino` is the lightest fit (it's Node-native, zero-dep, and Elysia integrates well). Wire it into the global `.onError(...)` in `apps/server/src/app.ts:20-23` so request method, URL, status code, and stack become a single JSON line.
2. Delete `packages/ui/src/button.tsx`'s starter `console.log` (and probably the whole `packages/ui` package if it stays unused — see §1.2).
3. Convert the startup banners in `apps/server/src/index.ts:4-6` to `logger.info({ port: 3000, swagger: "/swagger/json" }, "Server started")` once the logger is in place.

---

### 11. Error Handling

**Status:** ✅ Good

Backend status codes are explicit and varied — 200, 201, 204, 400, 403, 404, 409, 422 are all used in `wines.routes.ts`, `products.routes.ts`, `role-requests.routes.ts`, `utils/errors.ts`. A global `onError(...)` handler in `apps/server/src/app.ts:20-23` catches any uncaught throw and returns the message body.

A reusable error-mapping helper lives at `apps/server/src/utils/errors.ts`:

```
NOT_FOUND → 404
FORBIDDEN → 403
EMPTY_CART → 400
SHIPPING_ADDRESS_REQUIRED → 400
BILLING_ADDRESS_REQUIRED → 400
INSUFFICIENT_STOCK → 400
STATUS_CHANGE_INVALID → 409
```

Used throughout `products.routes.ts` (lines 58, 90, 108, 130, 153, 176, 198, 221). `wines.routes.ts` and `role-requests.routes.ts` repeat the pattern inline; consolidating them is suggested in §7.1.

Frontend error states are real, not fake-loading-spinners:

- `apps/web/src/routes/products.$productId.tsx:70-75` — `const { data, isError, refetch } = useGetProductsById(productId); if (isError || !data) { ... }`.
- `apps/web/src/routes/shops.index.tsx:25, 61` — explicit `isError` branch with `refetch`.
- `apps/web/src/routes/winemakers.$id.tsx:34`, `apps/web/src/routes/shops.$id.tsx:41` — same pattern.

The one bare `catch {}` (`apps/web/src/components/dashboard/ProfileEditForm.tsx:66`) is intentional — the comment says "Error is handled by the form error state," and the surrounding code does set a form error.

**Recommendations:**

1. Apply the `handleError(e)` helper in `wines.routes.ts` and `role-requests.routes.ts` (see §7.1 — same recommendation, listed here for completeness from the error-handling lens).
2. Consider a top-level React `<ErrorBoundary>` in `apps/web/src/main.tsx` for unhandled render errors — the current pattern handles data errors but not component throws.

---

### 12. Security

**Status:** ⚠️ Concerns

Positives:

- CORS is explicitly configured in `apps/server/src/app.ts:25` with a specific origin — no wildcard `*`.
- No hardcoded secrets in source code (a scan for `api_key=`, `apiKey=`, `secret=...` with high-entropy values returned zero hits).
- Drizzle's `sql` template tag is parameterized — the many `sql\`${...}\`` usages in `products.repository.ts` interpolate column references and JS values as bound parameters, not string concatenation. No injection risk.
- `.env`, `.env.local`, and per-environment `.env.*.local` are in `.gitignore`.

Concerns:

- `apps/server/src/app.ts:25` — `cors({ origin: "http://localhost:5173" })` is hardcoded. The deployed frontend will be blocked. The dev value is correct; the issue is that there is no env-var path. (Same finding as §4.1.)
- `.gitignore` covers `.env*` but does not have explicit entries for `*.pem`, `*.key`, `secrets/`, or `credentials*` files. Low risk today, but worth adding before any production keys land.
- The OpenAPI server URL is also hardcoded (`apps/server/src/app.ts:44`) — no security risk, but it tells anyone reading `/swagger/json` that you forgot to externalize it.

**Recommendations:**

1. Replace the hardcoded CORS origin with `cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173", credentials: true })` and document the env var requirement in `apps/server/.env.example` (it is already listed there — `FRONTEND_URL=http://localhost:5173`).
2. Tighten `.gitignore` with: `*.pem`, `*.key`, `*.crt`, `secrets/`, `credentials*.json`.
3. Once a real deploy target exists, verify Clerk's `CLERK_SECRET_KEY` and `CLERK_JWT_KEY` are stored in the platform's secret manager and never in `.env` files committed by accident — currently `auth.utils.ts:14`, `users.service.ts:12`, and `role-requests.service.ts:8` all read these from `process.env` correctly.
