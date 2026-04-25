# Architecture Redesign Pipeline (2026-04-24)

## Purpose

This document records the structured redesign discussion triggered by the architecture audit (`2026-04-24-architecture-audit.md`). It is a working document — not a post-hoc summary. Decisions are recorded as they are made, open questions are noted until answered, and the document is updated as each section progresses.

## Pipeline Overview

The redesign walks the full data stack in order, from auth to seed data. Each section answers one core question, makes one or more decisions, and produces action items that feed into the audit's Outstanding Work list.

```
A) Auth Flow        → How does a request prove who it is?
B) Route Structure  → Which pages exist and who can reach them?
C) Role Resolution  → Where do roles live in the frontend?
D) Database Schema  → Does the DB support the agreed domain model?
E) Code Generation  → How does the OpenAPI spec flow to frontend types?
F) Seed Data        → How does a fresh environment get meaningful data?
```

Status: **A ✅  B ✅  C ✅  D ✅  E ✅  F ✅**

---

## A) Auth Flow

**Core question:** How does a request prove who it is, and how do roles get into that proof?

### Options Considered

| Option | Description |
|--------|-------------|
| Clerk-first (redirect) | Clerk owns the full session lifecycle; frontend just reads session |
| Guard-first (beforeLoad) | TanStack Router `beforeLoad` checks Clerk session on every protected route |
| **Hybrid (chosen)** | Clerk owns "is authenticated?"; `beforeLoad` owns "is this role allowed here?" |

### Decisions

- **Auth provider:** Clerk. `ClerkProvider` wraps the app root. Clerk handles sign-in, sign-up, session refresh, token issuance.
- **Token content:** Clerk JWT template emits `roles: string[]` from `user.public_metadata.roles` (configured in Clerk dashboard). Previous `role`, `is_winemaker`, `is_shop_owner` fields removed.
- **Role type:** `AppRole = "customer" | "winemaker" | "shop_owner" | "admin"`. Every registered user automatically holds `["customer"]` on first login. Guest = absence of a Clerk session — not a role.
- **Backend auth:** `verifyClerkToken` reads `Authorization: Bearer <jwt>` header. `ClerkPayload` updated to `roles?: AppRole[]` (replacing the old three-field design).
- **Backend guards:** `authPlugin` macros use `payload.roles?.includes(role)` uniformly. Two macros: `requireAuth` (any session) and `requireRoles(roles: AppRole[])` (any-of check).

### Open Questions

None — section complete.

---

## B) Route Structure

**Core question:** Which pages exist, who can reach them, and how is that enforced at the router level?

### Domain Clarification (required before route design)

**Winemakers are B2B suppliers, not B2C retailers.** This fundamentally changes route ownership:

```
Winemaker → produces wines → supplies (via supply agreement) → Shop Owner → sells to → Customer
                                                                    ↑
                                              (one person can hold both roles simultaneously)
```

Winemakers manage their production catalog and supply relationships. Shop owners manage retail inventory sourced from approved supply agreements. A person can be both simultaneously — they use their shop_owner role for retail operations.

### Bundle Decision

Bundles are retail products (`products.shop_id FK`). Their entire purpose is sale through a shop. A winemaker who wants to create bundles does so through their shop_owner role. `_seller` pathless layout not needed.

**Bundle access: `shop_owner` only.**

### Supply Agreements

Shop owners can only list wines from winemakers they have an approved supply agreement with. This is a separate approval workflow from `role-requests` (which handles role elevation via admin). A new `supply-agreements` backend module is required.

### Agreed Route Tree

```
routes/
  __root.tsx                             ← ClerkProvider, QueryClientProvider, global layout

  index.tsx                              ← / (public)
  explore.tsx                            ← /explore (public catalog)
  wines.$id.tsx                          ← /wines/:id (public wine detail)
  winemakers.$id.tsx                     ← /winemakers/:id (public winemaker profile)
  shops.$id.tsx                          ← /shops/:id (public shop)
  events.tsx                             ← /events (public listing)
  events.$id.tsx                         ← /events/:id (public detail)
  cart.tsx                               ← /cart (guest + customer — session cookie)
  checkout.tsx                           ← /checkout (guest + customer — delivery info required)
  login.tsx                              ← /login (public, Clerk <SignIn>)
  register.tsx                           ← /register (public, Clerk <SignUp>)

  _authenticated.tsx                     ← pathless: Clerk session required → redirect /login
  _authenticated.dashboard.tsx           ← /dashboard (any customer)
  _authenticated.orders.tsx              ← /orders (customer order history)
  _authenticated.orders.$id.tsx          ← /orders/:id
  _authenticated.settings.tsx            ← /settings (profile, addresses)

  _authenticated._winemaker.tsx          ← pathless: roles.includes("winemaker")
  _authenticated._winemaker.wines.tsx    ← /wines (my production catalog)
  _authenticated._winemaker.supply.tsx   ← /supply (incoming supply requests — approve/reject)

  _authenticated._shop_owner.tsx         ← pathless: roles.includes("shop_owner")
  _authenticated._shop_owner.inventory.tsx       ← /inventory (retail stock from supply agreements)
  _authenticated._shop_owner.bundles.tsx         ← /bundles (create/manage bundles)
  _authenticated._shop_owner.shop-orders.tsx     ← /shop/orders (fulfillment)
  _authenticated._shop_owner.supply-browse.tsx   ← /supply/browse (find winemakers, send requests)

  _authenticated._admin.tsx              ← pathless: roles.includes("admin")
  _authenticated._admin.admin.tsx        ← /admin (back-office)
  _authenticated._admin.role-requests.tsx ← /admin/role-requests
  _authenticated._admin.users.tsx        ← /admin/users
  _authenticated._admin.moderation.tsx   ← /admin/moderation
```

### Route Access Matrix

| Route | Guest | Customer | Winemaker | Shop Owner | Admin |
|-------|-------|----------|-----------|------------|-------|
| `/`, `/explore`, `/events`, `/wines/:id` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/cart` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/checkout` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login`, `/register` | ✅ | — | — | — | — |
| `/dashboard`, `/orders`, `/settings` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/wines` (my catalog), `/supply` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/inventory`, `/bundles`, `/shop/orders`, `/supply/browse` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ❌ | ❌ | ✅ |

### Open Questions

None — section complete.

---

## C) Role Resolution

**Core question:** Where do roles live in the frontend, and how do components access them?

### Options Considered

| Option | Description |
|--------|-------------|
| Option 1 | `UserContext` owns everything: profile data + `roles: AppRole[]` from `sessionClaims` |
| Option 2 | Split: `UserContext` → profile data only; Clerk `useAuth()` → roles directly |
| **Option 2 + wrapper (chosen)** | Split, but wrap Clerk in a `useRoles()` hook for a single clean import |

### Decision

**`UserContext` owns profile data only. `useRoles()` is a thin Clerk adapter for role checks.**

```ts
// src/hooks/useRoles.ts
import { useAuth } from "@clerk/react"
import type { AppRole } from "@/types/roles"

export function useRoles(): AppRole[] {
  const { sessionClaims } = useAuth()
  return (sessionClaims?.roles as AppRole[]) ?? []
}
```

- `useUser()` → fname, lname, email from `/users/me` API (only called when signed in)
- `useRoles()` → `AppRole[]` from Clerk `sessionClaims` — zero network calls
- Route guards (`beforeLoad`) use `useRoles()`
- Conditional UI uses `useRoles().includes("winemaker")` etc.
- Components never mix `useUser()` and raw `useAuth()` — `useRoles()` is the Clerk-facing boundary

### Open Questions

None — section complete.

---

## D) Database Schema

**Core question:** Does the current schema support the agreed domain model, and what needs to change?

### Current Schema Issues

**Issue 1 — `users.role` column must be dropped**

```ts
role: userRoleEnum("role").notNull().default("user")  // enum: "user" | "admin"
```

Roles now live in Clerk. This column will drift from Clerk's source of truth. Drop the column and the `userRoleEnum` pg enum.

**Issue 2 — `carts` and `orders` are not guest-capable**

```ts
// carts
userId: uuid("user_id").notNull().unique()  // NOT NULL blocks guests; UNIQUE = one cart per user

// orders
userId: uuid("user_id").notNull()           // NOT NULL blocks guest checkout
```

Changes required:
- New `guest_sessions` table: `id UUID PK`, `created_at`, `expires_at`
- `carts.userId` → nullable; add `carts.sessionId UUID FK guest_sessions(id)` nullable
- Application-level constraint: exactly one of `userId`/`sessionId` is non-null
- `orders.userId` → nullable; add `orders.guestEmail text`, `orders.guestName text`

**Issue 3 — `supply_agreements` table missing**

The supply chain flow (shop owner requests supply from winemaker; winemaker approves/rejects) has no backing table. Required columns: `id`, `shopId FK shops(id)`, `winemakerId FK winemakers(id)`, `status (pending|approved|rejected)`, `createdAt`, `respondedAt`.

A shop should only be able to create a `product` (list a wine for retail) if an approved supply agreement exists for that wine's winemaker.

### Decisions from Schema Review

**Q1 — `wines.quantity` = producer stock (A)**

`wines.quantity` represents the winemaker's total available supply — how many bottles they have to distribute across shops. It decrements when a shop allocates stock (lists as a product). `products.quantity` is the shop's on-hand retail stock. Two separate stock levels in the supply chain:

```
wines.quantity      ← winemaker's distributable stock (decrements on shop allocation)
products.quantity   ← shop's retail stock (decrements on customer purchase)
```

Application logic must enforce: a shop cannot allocate more than `wines.quantity` available. Reallocation (returns, restocking) needs handling.

**Q2 — Multiple shops per user allowed**

Remove `.unique()` from `shops.ownerUserId`. One user can own N shops. Winemakers remain one-to-one with users (`.unique()` stays on `winemakers.userId`) — a person has one winemaker identity even if they produce multiple wine lines.

**Route implication (new finding → F-15):** If a user can own multiple shops, the shop-owner route area needs a shop selector. Flat routes like `/inventory` and `/shop/orders` assume a single active shop. With multiple shops, routes become `/shops/:shopId/inventory` and `/shops/:shopId/orders`, or a "current shop" context is set at the `_shop_owner` layout level.

### Open Questions

None — section complete.

---

## E) Code Generation

**Core question:** How does the OpenAPI spec flow from backend routes to frontend types and hooks?

### Decision

Replaced Kubb with Orval on TA recommendation. Pipeline:

```
Elysia routes + Zod schemas
        ↓
apps/server/scripts/export-spec.ts
  (normalizeSpec: fixes Zod v4 quirks → valid OpenAPI 3.0)
        ↓
apps/server/openapi.json
        ↓
Orval (apps/web/orval.config.ts)
  mode: tags-split, client: react-query, mutator: custom-instance.ts
        ↓
apps/web/src/generated/
  {tag}/{tag}.ts          ← typed React Query hooks
  model/{schema}.ts       ← TypeScript types
```

**Clerk JWT injection:** `apps/web/src/lib/custom-instance.ts` — axios interceptor calls `window.Clerk?.session?.getToken()` before each request and sets `Authorization: Bearer <token>`.

**Turbo dependency:** `generate` task has `dependsOn: ["^generate"]` — server exports spec before web runs Orval.

### Open Questions

None — section complete.

---

## F) Seed Data

**Core question:** How does a fresh environment get meaningful data for development and demo?

### Decisions

- **Tool:** `@faker-js/faker` — all data randomised on each run.
- **Reproducibility:** set `SEED_FAKER_SEED=<number>` env var to pin the generator.
- **Clerk users:** seed inserts synthetic `clerkId` values (`user_seed_<alphanumeric>`). These do not correspond to real Clerk accounts. The seed populates the DB for local UI dev and query testing; real auth still flows through Clerk's sign-in.
- **Script:** `apps/server/src/db/seed.ts`, run with `bun run db:seed` (or `turbo run db:seed` from root).
- **Idempotent:** tears down all rows (reverse dependency order) before re-seeding.

### Story Seeded

| Person | Roles | What they produce |
|--------|-------|-------------------|
| Alice Admin | `admin` | Platform administrator |
| Victor | `winemaker` | 6 wines, 2 events |
| Daria | `winemaker` + `shop_owner` | 3 wines, 2 shops (sources Victor's wines in shop 1, own wines in shop 2) |
| Sophie | `shop_owner` | 1 shop (sources from both Victor and Daria) |
| 3 × Customers | `customer` | Carts, orders, product reviews, winemaker reviews, event comments |

### Biome Overrides Added

`seed.ts` and `scripts/**` are exempt from `noConsole` and `noExcessiveCognitiveComplexity` — CLI output scripts are intentional consumers of `console`.

### Open Questions

None — section complete.

---

## Revision History

- **2026-04-24** — Pipeline document created; A, B, C, E decisions recorded; D open questions noted; F not yet discussed
