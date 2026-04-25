# Audit — Full Architecture (2026-04-24)

## Meta
- **Date:** 2026-04-24
- **Auditor:** Matěj Šinogl + Claude
- **Scope:** Entire codebase vs. design documents, course standards (seminars + sample projects), and agreed team conventions
- **Status:** OPEN

## Summary

The codebase is in reasonable shape for Week 8 but has accumulated several divergences from the design documents written in Week 6. The most significant gaps are: (1) the auth/role representation is inconsistent and does not scale, (2) the frontend route tree is flat and has no auth guards wired up, (3) guest cart is documented as localStorage but the team agreed to server-side sessions, and (4) several design documents are stale relative to actual decisions made. No finding is a hard blocker today, but the role system and route guard issues must be resolved before the WINE-121 (auth wiring) branch can be merged correctly.

---

## Findings

---

### F-01: Auth module does not follow the standard module pattern

- **Area:** backend
- **Severity:** minor
- **Status:** ✅ resolved (intentional divergence, documented)
- **Current state:** `auth/` contains `auth.plugin.ts` + `auth.utils.ts` — a middleware plugin, no route handlers.
- **Expected state:** `CLAUDE.md` prescribes `auth.routes.ts`, `auth.service.ts`, `auth.repository.ts`, `auth.schema.ts` per module.
- **Divergence:** Auth is cross-cutting middleware (JWT verification), not a CRUD resource. It does not need a routes/service/repo stack.
- **Decision:** Auth stays as a plugin. `CLAUDE.md` note added: auth module is intentionally a plugin, not a route module. All other modules follow the standard pattern.
- **Action items:** None — document only.

---

### F-02: Role representation is inconsistent and does not scale

- **Area:** backend + frontend + Clerk JWT template
- **Severity:** critical
- **Status:** ❌ open
- **Current state:**
  ```ts
  // auth.utils.ts — ClerkPayload
  role?: "user" | "admin";
  is_winemaker?: boolean;
  is_shop_owner?: boolean;
  ```
  Three separate fields, mixed string and boolean. `role` and `is_winemaker`/`is_shop_owner` are parallel but inconsistent — you cannot ask "what roles does this user have?" with a single expression.
- **Expected state:** A uniform `roles: AppRole[]` array that covers all capabilities. Role checks become `roles.includes("admin")` everywhere.
- **Divergence:** Original design grew incrementally. `role` was added first, booleans bolted on later.
- **Decision (D-01):** Replace with `roles: AppRole[]` throughout the stack.
  - `AppRole = "customer" | "winemaker" | "shop_owner" | "admin"`
  - Every registered user gets `["customer"]` by default on first login (`lazyGetOrCreate`)
  - Guest = absence of Clerk session — not a role in the array
  - Clerk JWT template updated to emit `roles: user.public_metadata.roles`
- **Action items:**
  - [ ] Update Clerk dashboard JWT template: `{ "roles": "{{user.public_metadata.roles}}" }`
  - [ ] Update `ClerkPayload` in `auth.utils.ts`: replace 3 fields with `roles?: AppRole[]`
  - [ ] Update `authPlugin` macros: `requireRole("admin")` → `roles.includes("admin")`, `requireCapability("winemaker")` → `roles.includes("winemaker")`
  - [ ] Update `lazyGetOrCreate` in `users.service.ts`: set Clerk public metadata `{ roles: ["customer"] }` on first user creation
  - [ ] Update frontend route guards to use `sessionClaims.roles`
  - [ ] Update `types/roles.ts` to match `AppRole`
  - [ ] Remove `Users.role` DB column (no longer needed — roles live in Clerk only) — generate and run migration

---

### F-03: Frontend routes are flat with no auth guards

- **Area:** frontend
- **Severity:** critical
- **Status:** ❌ open
- **Current state:** All routes sit flat at the root level. `dashboard.tsx` checks `isLoading` but has no actual auth guard — an unauthenticated user can visit `/dashboard` directly.
  ```
  routes/
    __root.tsx
    dashboard.tsx
    explore.tsx
    events.tsx
    inventory.tsx
    bundles.tsx
    cart.tsx
    orders.tsx
    settings.tsx
    logout.tsx
    search.tsx
  ```
- **Expected state (ROUTES/routes.md):** Role-based access enforcement per route. In practice, TanStack Router pathless layouts with `beforeLoad` guards are the idiomatic approach.
- **Divergence:** Route guards were never implemented — skeleton routes were created without auth wiring.
- **Decision (D-02):** Restructure to pathless layout tree. Winemakers are B2B suppliers (see F-05); shop owners are retailers. `_seller` layout dropped — bundles are shop_owner only.
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
    _authenticated._winemaker.wines.tsx    ← /wines (my production catalog — create/edit/delete)
    _authenticated._winemaker.supply.tsx   ← /supply (incoming supply requests — approve/reject)

    _authenticated._shop_owner.tsx         ← pathless: roles.includes("shop_owner")
    _authenticated._shop_owner.inventory.tsx       ← /inventory (retail stock from supply agreements)
    _authenticated._shop_owner.bundles.tsx         ← /bundles (create/manage bundles)
    _authenticated._shop_owner.shop-orders.tsx     ← /shop/orders (fulfillment)
    _authenticated._shop_owner.supply-browse.tsx   ← /supply/browse (find winemakers, send requests)

    _authenticated._admin.tsx              ← pathless: roles.includes("admin")
    _authenticated._admin.admin.tsx        ← /admin (back-office entry)
    _authenticated._admin.role-requests.tsx ← /admin/role-requests
    _authenticated._admin.users.tsx        ← /admin/users
    _authenticated._admin.moderation.tsx   ← /admin/moderation
  ```
- **Action items:**
  - [ ] Restructure route files to match the tree above
  - [ ] Create `_authenticated.tsx` with Clerk-based `beforeLoad` guard
  - [ ] Create `_producer.tsx`, `_winemaker.tsx`, `_shop_owner.tsx`, `_admin.tsx` role guards reading `sessionClaims.roles`
  - [ ] Create `/login` and `/register` pages using Clerk `<SignIn>` / `<SignUp>` components
  - [ ] Verify `/cart` is genuinely guest-accessible (no guard)

---

### F-04: Guest cart is documented as localStorage but team decided server-side sessions

- **Area:** backend + frontend + database
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `docs/notes.md` documents guest cart as localStorage-based with merge-on-login.
- **Expected state:** Team decision (D-03): Option B — server-side anonymous sessions.
- **Divergence:** `docs/notes.md` was written before the decision was revisited.
- **Decision (D-03):** Guest cart uses server-side anonymous sessions:
  - On first cart action, backend creates a `guest_session` record (UUID) and returns a session cookie
  - Cart rows in DB reference either `user_id` (authenticated) or `session_id` (guest)
  - Guest checkout: collect email + delivery info, create order with `guest_session_id` (no `user_id`)
  - On login/register: transfer guest session cart to user cart (server-side merge)
  - Guest sessions expire (e.g. 30 days)
- **Action items:**
  - [ ] Create `guest_sessions` table: `id UUID PK`, `created_at`, `expires_at`
  - [ ] Update `carts` table: `user_id` → nullable, add `session_id UUID FK guest_sessions(id)` nullable, add CHECK that exactly one of `user_id`/`session_id` is non-null
  - [ ] Update `orders` table: `user_id` → nullable, add `guest_email`, link delivery address without requiring auth
  - [ ] Generate and run migrations
  - [ ] Add `guest-sessions` backend module (create session, retrieve cart by session)
  - [ ] Update cart module to handle both authenticated and guest flows
  - [ ] Update `docs/notes.md` to reflect the new decision

---

### F-05: Domain model — winemakers are B2B suppliers, not B2C retailers

- **Area:** docs + backend + frontend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `docs/ROUTES/routes.md` shows `/inventory` under a shared seller area and implies winemakers have retail-facing inventory management.
- **Expected state:** The actual domain model is:
  ```
  Winemaker → produces wines → supplies (via supply agreement) → Shop Owner → sells to → Customer
                                                                      ↑
                                                    (a person can hold both roles simultaneously)
  ```
  Winemakers are upstream B2B. They never sell directly to customers. Their UI is about production catalog management and supply relationships, not retail inventory.
- **Decision (D-04):** Separate route ownership by role responsibility:
  - **Winemaker routes:** wine catalog (`/wines`), supply requests inbox (`/supply`), events
  - **Shop Owner routes:** retail inventory (`/inventory` = stocked wines from approved agreements), order fulfillment (`/shop/orders`), supply request outbox (`/supply/browse`)
  - **Bundles:** shop_owner only — a bundle is a retail product (`shop_id` FK in DB). Winemakers who want to bundle do so through their shop_owner role. The `_seller` pathless layout is not needed.
- **Action items:**
  - [ ] Update `docs/ROUTES/routes.md` to reflect the final route tree (see F-03)
  - [ ] Update `docs/ROLES/roles.md` WB-1/WB-2: winemaker stays ❌ for bundles (bundles are retail products)
  - [ ] Ensure bundle backend routes use `requireCapability("shop_owner")` only

---

### F-05b: `supply-agreements` module does not exist yet

- **Area:** backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** No backend module for supply agreements. `role-requests` handles role elevation (customer → winemaker/shop_owner via admin approval) — it is not for supply.
- **Expected state:** A separate `supply-agreements` module with its own routes/service/repository:
  - Shop owner sends supply request to a winemaker
  - Winemaker approves or rejects
  - On approval: shop can list that winemaker's wines as products in their shop
- **Action items:**
  - [ ] Create `supply-agreements` Drizzle table: `id`, `shop_id`, `winemaker_id`, `status (pending|approved|rejected)`, `created_at`, `responded_at`
  - [ ] Create `apps/server/src/modules/supply-agreements/` with full routes/service/repository/schema
  - [ ] Add supply agreement check to product creation — shop can only list wines from approved winemakers

---

### F-06: Private `-components/` and `-hooks/` pattern not implemented in frontend

- **Area:** frontend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** All components are global (`src/components/layout/`, `src/components/dashboard/`, `src/components/ui/`). No route-scoped `-components/` directories exist.
- **Expected state:** `CLAUDE.md` and `docs/ROUTES/routes.md` both prescribe route-private components in `-components/` directories adjacent to routes that own them.
- **Divergence:** Pattern not enforced — all components written as global by default.
- **Decision:** Enforce for new routes. Do not refactor existing components retroactively unless touching the area for another reason. Net-new components built during route restructure (F-03) should follow the pattern.
- **Action items:**
  - [ ] Add note to `CLAUDE.md`: route-private components go in `-components/` next to their route file, not in `src/components/`
  - [ ] Apply the pattern when creating new route files during F-03 restructure

---

### F-07: `UserContext` couples auth state to the `/users/me` API call unconditionally

- **Area:** frontend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `UserProvider` always calls `useGetUsersMe()` on mount — before Clerk's session is established. This means an unauthenticated user triggers a 401 API call on every page load.
- **Expected state:** The `/users/me` call should only fire when the user is authenticated (Clerk session exists).
- **Decision (D-05):** Split responsibility. `UserContext` owns profile data only. Roles come from Clerk via a dedicated `useRoles()` hook.
  ```ts
  // src/hooks/useRoles.ts — thin Clerk adapter
  export function useRoles(): AppRole[] {
    const { sessionClaims } = useAuth()
    return (sessionClaims?.roles as AppRole[]) ?? []
  }
  ```
  - `UserContext` / `useUser()` → profile display data (fname, lname, email) from `/users/me`
  - `useRoles()` → `AppRole[]` from Clerk `sessionClaims` — used in route guards and conditional UI
  - Components never import from both `useAuth()` and `useUser()` — `useRoles()` is the single Clerk-facing hook
- **Action items:**
  - [ ] Create `apps/web/src/hooks/useRoles.ts`
  - [ ] Add Clerk `useAuth().isSignedIn` guard inside `UserProvider` — skip `/users/me` call if not signed in
  - [ ] Remove any remaining `role` field references in components — replace with `useRoles().includes(...)`
  - [ ] Route guards (`beforeLoad`) use `useRoles()` to check role membership

---

### F-08: Toolchain — Kubb replaced by Orval

- **Area:** toolchain
- **Severity:** info
- **Status:** ✅ resolved
- **Current state:** Orval generates all API hooks from `apps/server/openapi.json`.
- **Previous state:** Kubb generated hooks.
- **Decision (D-06):** Orval selected on TA recommendation. Custom axios instance (`src/lib/custom-instance.ts`) handles Clerk JWT injection into every request via `window.Clerk?.session?.getToken()`.
- **Turbo pipeline:** `server:generate` (exports `openapi.json`) → `web:generate` (orval reads it).
- **Action items:** None — complete.

---

### F-09: OpenAPI spec normalizer required due to Zod v4 quirks

- **Area:** toolchain / backend
- **Severity:** info
- **Status:** ✅ resolved
- **Current state:** `apps/server/scripts/export-spec.ts` includes `normalizeSpec()` which transforms the raw Elysia/Zod v4 spec into valid OpenAPI 3.0 before writing `openapi.json`.
- **Transforms applied:**
  - `anyOf: [{type:"null"}]` → `nullable: true` (Zod v4 emits 3.1-style nullables inside a 3.0 spec)
  - `{type:"Date"}` entries removed (non-standard OpenAPI type from `z.date()`)
  - Operations missing `responses` get a `{"200": {description:"Success"}}` fallback
  - `204` responses have content stripped (must be body-less)
- **Action items:** None — complete. Document this if Zod or Elysia upgrades cause regressions.

---

### F-10: `docs/ARCHITECTURE/architecture.md` references Kubb, not Orval

- **Area:** docs
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** Architecture doc's data flow diagram still says `Kubb Code Generation`.
- **Action items:**
  - [ ] Update architecture.md data flow: replace `Kubb` with `Orval`
  - [ ] Update any Kubb references in `CLAUDE.md`

---

### F-11: `Users.role` column in DB is redundant once roles live in Clerk

- **Area:** database
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `users` table has a `role` column. The auth plugin reads `role` from the Clerk JWT, not from the DB. The DB column is not used for authorization.
- **Expected state (D-01):** Roles live exclusively in Clerk public metadata. The DB column should be dropped to avoid it ever becoming a stale source of truth.
- **Action items:**
  - [ ] Drop `role` column from `users` table in Drizzle schema
  - [ ] Generate and run migration
  - [ ] Remove any DB queries that read or write `users.role`

---

### F-12: `authPlugin` has code duplication across three macros

- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** `requireAuth`, `requireRole`, and `requireCapability` all independently call `verifyClerkToken` and `lazyGetOrCreate`. ~80% of the code is copy-pasted across three macros.
- **Decision:** After F-02 lands (roles array), consolidate into a single `requireAuth` that always verifies and derives `dbUser`, plus a separate `requireRoles(roles: AppRole[])` that checks `payload.roles` intersection. The three macros become two.
- **Action items:**
  - [ ] Refactor `authPlugin` after F-02 is implemented
  - [ ] New API: `requireAuth` (always, no role check) + `requireRoles(["admin"])` / `requireRoles(["winemaker", "shop_owner"])` (checks any-of)

---

### F-13: `lazyGetOrCreate` in `users.service.ts` syncs role to DB — unnecessary after F-02

- **Area:** backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `lazyGetOrCreate` likely writes role information to the `users` table when creating or updating a user.
- **Expected state (D-01):** Role lives in Clerk only. `lazyGetOrCreate` should only create the `users` DB row (for profile data) and set Clerk metadata `{ roles: ["customer"] }` on first creation. No role sync to DB.
- **Action items:**
  - [ ] Review `users.service.ts` → `lazyGetOrCreate`
  - [ ] Remove any DB role write
  - [ ] On first user creation: call Clerk `updateUserMetadata` to set `{ publicMetadata: { roles: ["customer"] } }`

---

### F-15: `shops.ownerUserId` has `.unique()` — blocks multiple shops per user

- **Area:** database
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `shops.ownerUserId` has `.unique()`, enforcing one shop per user at the DB level.
- **Decision:** Multiple shops per user allowed. Remove `.unique()` from `shops.ownerUserId`.
- **Route implication:** Shop-owner routes (`/inventory`, `/shop/orders`, `/bundles`) currently assume a single active shop. With multiple shops, these routes either need a `/:shopId` segment, or the `_shop_owner` layout must establish a "current shop" context (e.g. from a query param or user preference). Decision: **route-based** (`/shops/:shopId/inventory` etc.) is cleaner and bookmarkable.
- **Action items:**
  - [ ] Remove `.unique()` from `shops.ownerUserId` in `sellers.ts`; generate and run migration
  - [ ] Update shop-owner route tree: nest under `/shops/:shopId/` segment
  - [ ] Add `/shops` route (list my shops) under `_authenticated._shop_owner`
  - [ ] Update `_shop_owner` layout to read `shopId` from route params and validate ownership

---

### F-16: `wines.quantity` is producer distributable stock — needs allocation enforcement

- **Area:** backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `wines.quantity` exists but nothing prevents a shop from listing more units than the winemaker has available.
- **Decision:** `wines.quantity` = total bottles the winemaker has available to distribute. `products.quantity` = shop's retail stock. When a shop creates a product (lists a wine), application logic must verify `wines.quantity` is sufficient and decrement it.
- **Action items:**
  - [ ] Add allocation check in `products.service.ts`: before creating a product, verify `wines.quantity >= requested products.quantity`
  - [ ] Decrement `wines.quantity` atomically in the same transaction as product creation
  - [ ] Handle restocking (winemaker updates `wines.quantity`) and returns (product deleted → restore allocation)

---

### F-14: `/checkout` is listed as customer-only but guest checkout is now required

- **Area:** frontend + backend + docs
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `docs/ROLES/roles.md` OR-4 shows Checkout = ❌ for Guest. `docs/ROUTES/routes.md` implies checkout requires auth.
- **Expected state (D-03):** Guests can check out — they must provide email + delivery info, and an order is created with `guest_session_id`.
- **Action items:**
  - [ ] Update OR-4 in `docs/ROLES/roles.md`: Guest → ✅ (with required delivery info collection)
  - [ ] Update `docs/ROUTES/routes.md`: `/checkout` listed as public
  - [ ] Backend: checkout endpoint must accept unauthenticated requests with session cookie
  - [ ] Frontend: `/checkout` has no auth guard, but shows a "continue as guest" vs "sign in" choice if session not detected

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | Replace `role + is_winemaker + is_shop_owner` with `roles: AppRole[]` | Uniform, scalable, consistent with seminar RBAC patterns | ❌ pending |
| D-02 | Restructure frontend routes to pathless layout tree | TanStack Router idiom; Clerk owns auth, router owns role guards | ❌ pending |
| D-03 | Guest cart = server-side anonymous sessions (Option B) | Cart survives refresh, works across tabs, enables proper DB-backed order creation | ❌ pending |
| D-04 | Winemakers are B2B suppliers; bundles are shop_owner only; `_seller` layout dropped | Bundles are retail products (`shop_id` FK). Winemakers who also run a shop use their shop_owner role for bundles. Domain clarification from ERD + roles matrix. | ❌ pending |
| D-04b | New `supply-agreements` backend module required | Shop owners can only list wines from winemakers they have an approved supply agreement with. | ❌ pending |
| D-07 | `wines.quantity` = winemaker's distributable producer stock | Two stock levels: `wines.quantity` (supply chain) decrements on shop allocation; `products.quantity` (retail) decrements on customer purchase. | ❌ pending |
| D-08 | Multiple shops per user allowed; remove `.unique()` from `shops.ownerUserId` | A user can run N shops. Shop-owner routes nest under `/shops/:shopId/`. Winemaker remains one-to-one per user. | ❌ pending |
| D-05 | `UserContext` owns profile data only; `useRoles()` hook wraps Clerk `sessionClaims` | Clean separation: Clerk owns auth/roles, DB owns profile data. `useRoles()` gives components a single import point without mixing concerns. | ❌ pending |
| D-06 | Replace Kubb with Orval for API code generation | TA recommendation; better OpenAPI 3.0 compatibility, cleaner output | ✅ done |

---

## Outstanding Work

Ordered by priority (critical → major → minor):

### Critical — Must fix before WINE-121 can be merged correctly

1. **F-02** — Update `ClerkPayload` type to `roles: AppRole[]`
2. **F-02** — Update `authPlugin` macros to use `roles.includes()`
3. **F-03** — Restructure frontend route tree with pathless layouts
4. **F-03** — Create `_authenticated.tsx` Clerk guard
5. **F-03** — Create role-specific pathless layouts (`_producer`, `_winemaker`, `_shop_owner`, `_admin`)
6. **F-03** — Create `/login` and `/register` pages with Clerk components
7. **F-07** — Make `UserProvider` conditional on Clerk session; expose `roles` from `sessionClaims`

### Major — Fix within current sprint (Week 8)

8. **F-04** — Create `guest_sessions` table + update `carts`/`orders` schema (migration)
9. **F-04** — Add guest-sessions backend module
10. **F-11** — Drop `Users.role` DB column (migration)
11. **F-13** — Clean up `lazyGetOrCreate`: remove DB role sync, add Clerk metadata write on first creation
12. **F-14** — Update OR-4 permission (guest checkout) in docs + backend + frontend
13. **F-05** — Update bundle permissions in docs and backend routes

### Major — Fix within current sprint (cont.)

15. **F-15** — Remove `.unique()` from `shops.ownerUserId`; nest shop-owner routes under `/shops/:shopId/`
16. **F-16** — Add `wines.quantity` allocation enforcement in product creation service

### Minor — Fix when touching the area

17. **F-12** — Refactor `authPlugin` macros to remove duplication (after F-02)
18. **F-10** — Update `architecture.md` data flow: Kubb → Orval
19. **F-06** — Apply `-components/` pattern for new routes going forward
20. **F-04** — Update `docs/notes.md` to reflect guest cart decision change

---

## Revision History

- **2026-04-24** — Initial audit created (Matěj + Claude)
