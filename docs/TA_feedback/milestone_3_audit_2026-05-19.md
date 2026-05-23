# WineMarket — Milestone 3 Pre-Submission Audit
**Date:** 2026-05-19  
**Auditor:** Senior TA (synthetic — automated deep-read of entire codebase)  
**Branch:** `feature/WINE-204-e2e-ci-regression`  
**Based on:** Milestone 2 TA review (2026-04-30) + full file-by-file investigation

---

## Executive Summary

The backend is **production-quality** — modular, typed, tested, secure. The frontend has a **dangerous split personality**: roughly half the route files are stub pages (`[STUB]` title + `<RouteStub>`/`<StubPage>` components), while a parallel set of real-looking dashboard tab components exist but are **completely disconnected from any route** (orphan dead code). The gap between what the backend can do and what the frontend exposes to a user is the biggest risk for Milestone 3.

**Backend: ✅ Strong** · **Frontend routing: ❌ Critical** · **Frontend components: ⚠️ Mixed**

---

## Part 1 — Milestone 2 TA Feedback: Line-by-Line Verdict

### §1 Component Library

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| Raw `<button>` in 6 locations | Open | **✅ FIXED** | No raw `<button>` in feature components (only in ui primitives and tests) |
| `packages/ui` starter package | Open | **✅ FIXED** | Package deleted entirely |

### §2 Styling

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| `MyWines.tsx` 648 lines | Open | **✅ FIXED** | File is now 74 lines — successful tab refactor |
| Hex color literals in `MyWines.tsx` | Open | **⚠️ PARTIALLY FIXED** | Hex colors migrated *into* tab subcomponents rather than eliminated — `WinemakerEvents.tsx` has 12+ hex literals (see §Part 2 below) |
| `text-[15px]`/`text-[10px]` in `MyWines.tsx` | Open | **⚠️ PARTIALLY FIXED** | Still present in `WinemakerInventory.tsx:117,126`, `WinemakerEvents.tsx:105,138,150,163` and other tabs |
| Badge should have `success`/`warning`/`danger` variants | Recommendation | **✅ ALREADY DONE** | `badge.tsx` already has all variants; tab components use `statusVariant()` helper correctly — but `WinemakerEvents.tsx` bypasses both and uses raw hex |

### §3 Loading Data

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| `ShopMapEmbed` raw `fetch` | Open | **✅ FIXED** | Now uses `useQuery({ queryKey: ['osm-geocode', ...] })` from TanStack Query |

### §4 Environment Variables

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| CORS hardcoded origin | Open | **✅ FIXED** | `app.ts:24` reads `process.env.FRONTEND_URL \|\| "http://localhost:5173"` |
| OpenAPI server URL hardcoded | Open | **✅ FIXED** | `app.ts:25` reads `process.env.API_URL \|\| "http://localhost:3000"` |
| `db/index.ts` placeholder fallback | Open | **✅ FIXED** | `db/index.ts:5-7` throws `Error("DATABASE_URL is required")` when `!DATABASE_URL && NODE_ENV !== "test"` |

### §5 REST API Design
**Status: ✅ UNCHANGED — still good**

### §6 Database

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| `products.repository.ts` 638 lines | Open | **✅ FIXED** | Now 366 lines (43% reduction) — bundle/stock logic extracted |

### §7 Backend Design Patterns

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| `wines.routes.ts` inline error handling | Open | **✅ FIXED** | All errors flow through `errorPlugin` via `AppError` classes — no inline `if (e.message === ...)` |
| `role-requests.routes.ts` inline error handling | Open | **⚠️ STILL OPEN** | `role-requests.routes.ts:63-69` — GET `/:id` still has `if (e instanceof Error && e.message === "NOT_FOUND") return status(404, ...)` |

### §8 Auth
**Status: ✅ UNCHANGED — still good**

### §9 Testing

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| Two `placeholder.test.ts` files | Open | **✅ FIXED** | Both deleted |
| Frontend coverage thin (8 vs 33 tests) | Open | **✅ IMPROVED** | Frontend now has 39 test files; backend has 39 test files |
| `WineCatalog.tsx`, `MyWines.tsx`, cart/checkout tests | Recommendation | **⚠️ OPEN** | `DashboardTabs.test.tsx` exists; cart/checkout flow tests are missing |

### §10 Logging & Monitoring

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| No structured logger | Open | **✅ FIXED** | `pino` + `pino-pretty` in `apps/server/src/utils/logger.ts` |
| `packages/ui/button.tsx` starter `console.log` | Open | **✅ FIXED** | Package deleted |
| Startup banners still `console.log` | Open | **⚠️ OPEN** | `apps/server/src/index.ts` still uses `console.log` for startup — the logger exists but isn't wired to startup yet |

### §11 Error Handling

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| `wines.routes.ts` / `role-requests.routes.ts` inline | Open | **Partially fixed** — wines done, role-requests still open (see §7) | |
| No `<ErrorBoundary>` in `main.tsx` | Open | **✅ FIXED** | `<AppErrorBoundary>` wraps `<RouterProvider>` in `main.tsx:41-55` |

### §12 Security

| Sub-issue | M2 Finding | Current Status | Evidence |
|---|---|---|---|
| CORS hardcoded | Open | **✅ FIXED** | Reads `process.env.FRONTEND_URL` |
| `.gitignore` missing `*.pem`, `*.key`, etc. | Open | **✅ FIXED** | `.gitignore:54-58` now has `*.pem`, `*.key`, `*.crt`, `secrets/`, `credentials*.json` |

### M2 Summary Score
**15 of 18 issues resolved. 3 open: `role-requests.routes.ts` inline error, hex colors migrated not eliminated, startup banners not yet using logger.**

---

## Part 2 — New Issues Discovered (Not in M2 Review)

### 🔴 CRITICAL — Will lose points at defense

#### C1. 38 of 79 route files are stubs — the frontend is half-built

This is the highest-risk item in the project. A significant portion of the frontend is not implemented:

**Complete stub pages (show "This page is not implemented yet"):**
- `_authenticated._admin.users.tsx` — Admin user management
- `_authenticated._admin.moderation.tsx` — Content moderation
- `_authenticated._admin.role-requests.tsx` — Role request management
- `_authenticated._admin.shops.tsx` — Admin shop listing
- `_authenticated._admin.winemakers.tsx` — Admin winemaker listing
- `_authenticated._admin.products.tsx` — Admin product listing
- `_authenticated.orders.tsx` — Order history (see C3)
- `shops.$id.inventory.tsx` — Shop inventory list
- `shops.$id.inventory.new.tsx` — Add product to shop
- `shops.$id.supply-incoming.tsx` — Incoming supply agreements
- `shops.new.tsx` — Create new shop
- `wines.index.tsx` — Wine list page
- `wines.new.tsx` — Create wine
- `products.new.tsx` — Create product
- `events.new.tsx` — Create event

**Stub-data pages (show API data but no real UI):**
- `_authenticated.dashboard.tsx` — Dashboard (StubPage with raw JSON)
- `_authenticated._admin.events.tsx` — Admin events (StubGet only)
- `_authenticated._admin.users.$id.tsx` — Admin user detail (StubGet)
- `_authenticated._admin.role-requests.$id.tsx` — Role request detail (StubGet)
- `_authenticated.stats.tsx` — Stats page (StubGet)
- `_authenticated.orders.$id.tsx` — Order detail (StubGet)
- `events.$id.invitations.tsx` — Event invitations (StubGet)
- `checkout.confirmed.tsx` — Post-checkout confirmation (StubPage)
- `shops.$id.orders.tsx` — Shop order management (StubGet)
- `shops.$id.supply-browse.tsx` — Browse supply (StubGet)
- `events.$id.images.tsx` / `wines.$id.images.tsx` / `shops.$id.images.tsx` / `winemakers.$id.images.tsx` — Image management (StubGet)
- `events.$id.edit.tsx` / `wines.$id.edit.tsx` / `shops.$id.edit.tsx` / `shops.$id.availability.tsx` / `shops.$id.inventory.$productId.edit.tsx` / `winemakers.$id.edit.tsx` — Edit forms (StubGet/RouteStub)

**Implication for defense:** If the TA clicks "My Orders", "Create Wine", "Admin: Users", or "Dashboard", they will see `[STUB]` placeholders. This directly contradicts the claimed feature completeness.

#### C2. `DashboardTabs` and `MyWines` components are orphans — never used

The dashboard tab components (`DashboardTabs.tsx`, `MyWines.tsx` and all their subtabs) are imported by zero route files. The actual dashboard route (`_authenticated.dashboard.tsx`) is a `StubPage`.

Evidence: `grep -r "DashboardTabs\|MyWines" apps/web/src/routes` returns **zero matches**.

The components appear to have been built in isolation without being wired to a route. They also use hardcoded mock data arrays (see C4).

#### C3. Orders list endpoint exists on backend but frontend shows "BE endpoint missing"

`orders.routes.ts:76-105` implements `GET /orders` which returns the authenticated user's orders when called without a `shopId`. The frontend stub at `_authenticated.orders.tsx` says:

```
Hook useGetOrders / useGetOrdersMe not present in generated client.
BE list endpoint missing — see audit.
```

This is either (a) a regeneration issue — `bun run generate` hasn't been run since the endpoint was added — or (b) the response type schema is `t.Array(orderResponse)` but missing from the OpenAPI spec due to the inline response definition. Either way the frontend perceives a missing endpoint that is actually there.

#### C4. Tab components use hardcoded mock data, not real API

All "real-looking" dashboard components contain hardcoded arrays:
- `WinemakerInventory.tsx:26-55` — 4 hardcoded wine objects
- `WinemakerEvents.tsx:7-45` — 4 hardcoded event objects  
- `ShopOwnerInventory.tsx` — hardcoded inventory rows
- `BundlesListTab.tsx:14-17` — 2 hardcoded bundles
- `EventsListTab.tsx:14-31` — 2 hardcoded events
- `WinemakerInventoryTab.tsx:21-26` — 4 hardcoded wines

These components look finished but are design mockups masquerading as working features.

#### C5. `lucide-react` used in 24 files — explicit rule violation

`CLAUDE.local.md` Rule A6 states: "Icon imports come from `hugeicons-react`. Do not introduce `lucide-react`."

Current count: **24 source files** still import from `lucide-react`, including:
- All dashboard tab components (`WinemakerInventoryTab`, `BundlesListTab`, `EventsListTab`, `DashboardTabs`, etc.)
- Cart components (`CartItemRow`, `QuantityControl`, `DeliveryMethodToggle`, `CartEmpty`)
- `Sidebar.tsx`, `Header.tsx`, `UserInfoCard.tsx`
- Event, winemaker, and shop route files

This is a project-wide pattern violation that the TA's M2 review did not flag because it wasn't in scope, but it is explicitly forbidden in `CLAUDE.local.md`.

---

### 🟠 HIGH — Likely to lose points

#### H1. `orders.routes.ts` has 3 inline error handlers (not using `AppError`)

The TA praised products.routes.ts for using `handleError`. `orders.routes.ts` never got the same treatment:
- Lines 86-95: `GET /orders` (shop path) — inline `if (e.message === "NOT_FOUND")`
- Lines 143-149: `GET /:id` — inline `if (e.message === "NOT_FOUND")`
- Lines 163-173: `PATCH /:id/status` — inline `if (e.message === "NOT_FOUND" / "FORBIDDEN" / "INVALID_TRANSITION")`

This is in addition to `role-requests.routes.ts:63-69` from M2.

#### H2. `admin.routes.ts` has 6 `t.Any()` response schemas

Every admin endpoint returns `t.Any()`:
- Line 30: `GET /admin/events`
- Line 43: `POST /admin/events/:id/approve`  
- Line 55: `POST /admin/events/:id/reject`
- Line 79: `GET /admin/users`
- Line 102: `GET /admin/users/:id` (and `200: t.Any()`)
- Line 121: `PATCH /admin/users/:id/status`
- Line 141: `GET /admin/reviews`
- Line 159: `DELETE /admin/reviews/:id`

Impact: The Kubb-generated client emits `unknown` return types for all admin hooks. The TA's M2 note specifically called out "validation typebox" — `t.Any()` is the direct violation.

`products.routes.ts:33` also returns `t.Any()` for `GET /products/:id`.

#### H3. `WinemakerEvents.tsx` — worse hex color situation than M2's `MyWines.tsx`

The M2 TA flagged ~9 hex instances in `MyWines.tsx`. After refactoring, `WinemakerEvents.tsx` now has **12+ hardcoded hex values**, including brand colors:

```tsx
// Line 52-66: Badge colors
className="border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] ..."
className="border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] ..."

// Line 76: Button background
className="... bg-[#8B2E3D] hover:bg-[#8B2E3D]/90 text-white ..."

// Lines 82-85: Card backgrounds
className="bg-[#EFEAE8]/50 ..."
className="border-[#E5DFDD] ..."
className="bg-[#10B981] ..."

// Lines 105, 117, 138, 150, 163: Text sizes
className="... text-[12px] ..."
className="... text-[16px] ..."
className="... text-[15px] ..."
className="... text-[13px] ..."
className="... text-[11px] ..."
```

The badge colors are completely redundant — `badge.tsx` already has `variant="success"` (green) and `variant="warning"` (amber) that render identically. `bg-[#8B2E3D]` is a hardcoded brand wine-red that should be `bg-primary`. The `#EFEAE8` background is close to `bg-muted` or `bg-secondary`.

#### H4. Backend services still throw plain `Error` strings instead of `AppError` subclasses

`packages/shared/src/errors/base.ts` defines `NotFoundError`, `ForbiddenError`, `BadRequestError`, `ConflictError` — a proper error hierarchy that integrates with `errorPlugin`. But many services still throw:

```ts
throw new Error("NOT_FOUND")       // orders.service.ts:167,179
throw new Error("FORBIDDEN")       // orders.service.ts:168,181
throw new Error("INVALID_TRANSITION")  // orders.service.ts:196
throw new Error("CART_EMPTY")      // orders.service.ts:112
```

These plain string errors bypass `errorPlugin`'s `instanceof AppError` check at `error-plugin.ts:14`, so they fall through to the generic 500 handler. The routes then manually catch them with string comparison. This defeats the purpose of the error class hierarchy.

#### H5. `pino-pretty` transport is hardcoded — will fail or be slow in production

`apps/server/src/utils/logger.ts`:
```ts
export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});
```

`pino-pretty` is a dev-only pretty-printer. In production it adds significant overhead and its output is not machine-parseable. The logger should be:

```ts
export const logger = pino(
  process.env.NODE_ENV === "production"
    ? {}
    : { transport: { target: "pino-pretty", options: { colorize: true } } }
);
```

#### H6. `AppErrorBoundary` silently swallows all frontend errors

`AppErrorBoundary.tsx:22-25`:
```ts
public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
  // TODO: Implement frontend error reporting service (e.g. Sentry or local logger)
  // console.error("Uncaught error:", error, errorInfo);
}
```

Both the TODO and the `console.error` are commented out. Component crashes are swallowed completely. A developer seeing a blank "Something went wrong" screen has zero debugging information. At minimum, re-enable the `console.error` in non-production.

---

### 🟡 MEDIUM — Code quality / polish

#### M1. `role-requests.routes.ts:63-69` — inline error still open from M2

```ts
try {
  return await roleRequestsService.getById(params.id);
} catch (e: unknown) {
  if (e instanceof Error && e.message === "NOT_FOUND")
    return status(404, "Request not found");
  throw e;
}
```

This was explicitly flagged in M2 §7. Fix: throw `NotFoundError` from the service, let `errorPlugin` handle it.

#### M2. `index.ts` startup banners not using logger

`apps/server/src/index.ts` still uses `console.log` for startup. The pino logger exists — wire it in:

```ts
// Current
console.log(`🚀 Server running at http://localhost:${port}`);

// Should be
logger.info({ port }, "Server started");
```

#### M3. `text-[Npx]` ad-hoc font sizes persist in 10+ places

Beyond `WinemakerEvents.tsx`, these also appear in:
- `WinemakerInventory.tsx:117` — `text-[15px]`
- `WinemakerInventory.tsx:126` — `text-[10px]`
- `ShopOwnerBundles.tsx` (multiple)
- `WinemakerBundles.tsx` (multiple)

The Tailwind scale covers all these: `text-xs` (12px), `text-sm` (14px), `text-base` (16px).

#### M4. CI does not run Playwright E2E tests

`ci.yml` has jobs: `install`, `generate`, `lint`, `typecheck`, `build`, `test`. The `test` job runs `bun run test` (Vitest unit tests). There is no Playwright job. The E2E tests at `apps/web/src/__tests__/e2e/` are never exercised in CI.

Given the WINE-204 branch is specifically about "E2E CI regression", this is directly relevant.

#### M5. Two parallel sets of dashboard components — dead code

There are two independent implementations in `apps/web/src/components/dashboard/`:

**Set A (flat, used by `MyWines.tsx`):** `WinemakerInventoryTab`, `BundlesListTab`, `EventsListTab`, `ShopOwnerInventoryTab`, `CustomerOrderHistoryTab`

**Set B (nested, used by `DashboardTabs.tsx`):** `tabs/wines/WinemakerInventory`, `tabs/events/WinemakerEvents`, `tabs/bundles/WinemakerBundles`, `tabs/events/ShopOwnerEvents`, `tabs/bundles/ShopOwnerBundles`, etc.

Neither `MyWines.tsx` nor `DashboardTabs.tsx` is imported by any route. Both are dead code. This means ~15 component files exist that are never rendered.

#### M6. `AppErrorBoundary` TODO comment committed to main path

```ts
// TODO: Implement frontend error reporting service (e.g. Sentry or local logger)
```

Committed TODO comments are considered tech debt markers. Either implement it (even a `console.error` is better than nothing) or remove the comment.

---

### 🟢 LOW / NICE TO HAVE

#### L1. `orders.service.ts:158` — `afterCheckout` errors silently ignored

```ts
this.afterCheckout(order, items, userId, data).catch(() => {
  /* ignore */
});
```

Email failures are completely silent. The `logger` is available — at minimum:

```ts
this.afterCheckout(order, items, userId, data).catch((err) => {
  logger.warn({ err, orderId: order.id }, "afterCheckout failed");
});
```

#### L2. `orders.service.ts` uses `new Error()` while email service uses `logger.error`

There's an inconsistency: the email error handling in `sendOrderConfirmation` uses `logger.error` correctly, but the service-layer domain errors use plain `new Error("NOT_FOUND")` string codes. Pick one: either all domain errors use `AppError` subclasses (preferred) or stay with strings (consistent but lossy).

#### L3. Admin `role-requests` frontend stub despite full backend implementation

`_authenticated._admin.role-requests.tsx` shows "Role Requests — This page is not implemented yet." But `role-requests.routes.ts` has full CRUD (`GET /`, `GET /:id`, `PATCH /:id/approve`, `PATCH /:id/reject`), and the generated Kubb client exports all hooks. This is among the higher-value admin features to implement for the defense.

#### L4. `products.routes.ts:33` `t.Any()` on single product response

```ts
response: { 200: t.Any(), 404: errorResponse },
```

There is a `getAllProductsResponse` schema in `products.schema.ts` — a similar `getProductByIdResponse` schema should be trivial to add and would fix the `unknown` return type on the frontend.

---

## Part 3 — Feature Completeness Audit

| Feature | Backend | Frontend | Demo-able? |
|---|---|---|---|
| Wine catalog browse | ✅ | ✅ (`wines.$id.tsx`, `explore.tsx`) | ✅ Yes |
| Wine create/edit | ✅ | ❌ Stub | No |
| Shop browse | ✅ | ✅ (`shops.index.tsx`, `shops.$id.tsx`) | ✅ Yes |
| Shop create | ✅ | ❌ Stub | No |
| Shop edit/availability | ✅ | ❌ Stub | No |
| Product/bundle create | ✅ | ❌ Stub | No |
| Product/bundle edit | ✅ | ❌ Stub | No |
| Shop inventory | ✅ | ❌ Stub | No |
| Events browse | ✅ | ✅ (`events.index.tsx`, `events.$id.tsx`) | ✅ Yes |
| Event create | ✅ | ❌ Stub | No |
| Event edit | ✅ | ❌ Stub | No |
| Cart + checkout | ✅ | ✅ (`cart.tsx`, checkout logic) | ✅ Yes |
| Order history (user) | ✅ | ❌ Stub ("BE missing") | No (see C3) |
| Order detail | ✅ | ⚠️ StubGet (JSON dump) | Partial |
| Dashboard | ✅ | ❌ Stub | No |
| Role request (submit) | ✅ | ✅ (via dashboard stub's mutation) | Partial |
| Admin: users | ✅ | ❌ Stub | No |
| Admin: events | ✅ | ⚠️ StubGet | Partial |
| Admin: reviews | ✅ | ❌ Stub | No |
| Admin: role-requests | ✅ | ❌ Stub | No |
| Supply agreements | ✅ | ⚠️ StubGet | Partial |
| Winemaker profile | ✅ | ✅ (`winemakers.$id.tsx`) | ✅ Yes |
| Stats | ✅ | ⚠️ StubGet | Partial |
| Reviews (product page) | ✅ | ✅ (on product detail page) | ✅ Yes |
| Images | ✅ | ❌ Stub | No |

**Demo-able end-to-end flows:** Browse wines → Add to cart → Checkout · Browse shops · View events · Winemaker profiles · Product pages

**Not demo-able:** Everything requiring form input to create/edit resources; entire admin panel; order history; dashboard; availability management.

---

## Part 4 — What's Genuinely Strong (Don't Touch)

1. **Backend architecture** — 16 modules, all holding the 4-layer pattern. Repository never leaks into routes. Services own business logic. This is textbook.

2. **Error class hierarchy** — `packages/shared/src/errors/base.ts` with `AppError`, `NotFoundError`, `ForbiddenError`, `BadRequestError`, `ConflictError` and `errorPlugin` that auto-maps them is the right pattern. Most of the backend uses it (orders and role-requests haven't caught up).

3. **CI pipeline** — 6-stage pipeline: cache → generate → lint → typecheck → build → test. OpenAPI drift detection in `generate` job is production-grade.

4. **Email service** — Resend integration with templates for order confirmation, status update, event approval, role request approved/rejected. Actually wired and called from service layer.

5. **CORS/env/gitignore** — All three M2 security concerns are properly resolved.

6. **Pino logger** — In place and wired to `errorPlugin`. Just needs conditional transport.

7. **`AppErrorBoundary`** — Class-based React boundary with proper `getDerivedStateFromError`. Just needs `componentDidCatch` un-commented.

8. **Test count** — 39 backend + 39 frontend tests. `DashboardTabs.test.tsx` is the most meaningful FE test.

---

## Part 5 — Prioritized Action List

### P0 — Defense blockers (must fix before demo)

| # | Action | File | Effort |
|---|---|---|---|
| 1 | Connect `DashboardTabs.tsx` to `_authenticated.dashboard.tsx` | `apps/web/src/routes/_authenticated.dashboard.tsx` | 2h |
| 2 | Replace `StubPage`/`RouteStub` in admin user management with real `useGetAdminUsers` UI | `_authenticated._admin.users.tsx` | 3h |
| 3 | Replace admin role-requests list with real UI | `_authenticated._admin.role-requests.tsx` | 2h |
| 4 | Fix order history: run `bun run generate` or add `GET /orders/me` alias and wire `_authenticated.orders.tsx` | `orders.routes.ts` + `_authenticated.orders.tsx` | 2h |
| 5 | Replace hardcoded data in dashboard tabs with real API calls | `WinemakerInventory.tsx`, `WinemakerEvents.tsx`, `WinemakerBundles.tsx` | 4h |

### P1 — Will lose points in graded review

| # | Action | File | Effort |
|---|---|---|---|
| 6 | Replace `t.Any()` with proper TypeBox schemas in `admin.routes.ts` | All 8 endpoints | 1h |
| 7 | Replace `t.Any()` in `products.routes.ts:33` | `GET /products/:id` | 20min |
| 8 | Fix `role-requests.routes.ts:63-69` inline error (M2 open) | Throw `NotFoundError` from service | 10min |
| 9 | Fix `orders.routes.ts` inline error handling × 3 | Lines 86-95, 143-149, 163-173 | 20min |
| 10 | Convert service `new Error("NOT_FOUND")` strings to `NotFoundError` in orders.service.ts | 4 throw sites | 30min |
| 11 | Fix `pino-pretty` to be dev-only | `apps/server/src/utils/logger.ts` | 5min |
| 12 | Un-comment `componentDidCatch` console.error | `AppErrorBoundary.tsx:23` | 2min |

### P2 — Code quality / M2 residue

| # | Action | File | Effort |
|---|---|---|---|
| 13 | Replace hex colors in `WinemakerEvents.tsx` with badge variants + design tokens | Line 52-163 | 30min |
| 14 | Replace `text-[Npx]` with Tailwind scale everywhere | 10 files | 20min |
| 15 | Wire `pino` logger to startup banners in `index.ts` | `apps/server/src/index.ts` | 5min |
| 16 | Delete dead code: `MyWines.tsx` + flat tab components (Set A) if `DashboardTabs` is wired | 6 files | 10min |
| 17 | Add Playwright job to `ci.yml` | `.github/workflows/ci.yml` | 30min |

### P3 — Nice to have

| # | Action | File | Effort |
|---|---|---|---|
| 18 | Replace `lucide-react` with `hugeicons-react` in 24 files | Multiple | 2h |
| 19 | Add wine create form (`wines.new.tsx`) | Route stub | 3h |
| 20 | Add shop create form (`shops.new.tsx`) | Route stub | 3h |
| 21 | `afterCheckout` should log failures instead of swallowing them | `orders.service.ts:158` | 5min |

---

## Part 6 — Appendix: Key File Reference

| File | Lines | Status | Primary Issue |
|---|---|---|---|
| `apps/server/src/modules/admin/admin.routes.ts` | 162 | Issues | 8× `t.Any()` + 1 inline error handler |
| `apps/server/src/modules/orders/orders.routes.ts` | 204 | Issues | 3 inline error handlers |
| `apps/server/src/modules/role-requests/role-requests.routes.ts` | 105 | Issues | GET /:id inline error (M2 open) |
| `apps/server/src/modules/orders/orders.service.ts` | 281 | Issues | 4 plain `new Error()` string throws |
| `apps/server/src/utils/logger.ts` | 11 | Issues | `pino-pretty` unconditional |
| `apps/web/src/components/AppErrorBoundary.tsx` | 35 | Issues | `componentDidCatch` disabled |
| `apps/web/src/components/dashboard/tabs/events/WinemakerEvents.tsx` | 174 | Issues | 12+ hex colors, 5 pixel font sizes, hardcoded data |
| `apps/web/src/components/dashboard/tabs/wines/WinemakerInventory.tsx` | 169 | Issues | Hardcoded data, 2 pixel sizes |
| `apps/web/src/routes/_authenticated.dashboard.tsx` | 85 | Critical | StubPage — not using DashboardTabs |
| `apps/web/src/routes/_authenticated.orders.tsx` | 19 | Critical | Stub — reports missing BE hook (hook exists) |
| `apps/web/src/routes/_authenticated._admin.users.tsx` | 10 | Critical | RouteStub |
| `apps/web/src/components/dashboard/DashboardTabs.tsx` | 88 | Dead code | Not imported by any route |
| `apps/web/src/components/dashboard/MyWines.tsx` | 74 | Dead code | Not imported by any route |
