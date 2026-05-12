# WINE-59 — Home Page + User Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stubs on `/` (composite homepage) and `/dashboard` (authenticated user hub) with real UI. Dashboard subsumes the old `/settings` and `/role-request` concepts: edit own profile, view per-role quick-stats teaser, request a new role, quick-links to "my X" filtered catalog views.

**Architecture:** Same cascade pattern. New domain components in `apps/web/src/components/home/` and `apps/web/src/components/dashboard/` (some already exist in `dashboard/`). Home page composes featured slices via existing list hooks limited to ~3 items each.

**Tech Stack:** Same as WINE-68.

**Predecessor:** WINE-187 merged. Reuses `<WineCard>`, `<WinemakerCard>` from WINE-68 if available — otherwise stand in with `<Card variant="catalog">` ad-hoc cards (mark for migration when WINE-68 lands).

---

## Hard rules

Identical to WINE-68 §"Hard rules". Conventional commit prefix here: `feat(WINE-59):` / `refactor(WINE-59):` / `chore(WINE-59):`.

---

## 1. Branch bootstrap

```powershell
git fetch origin
git checkout WINE-59-build-user-dashboard-skeleton-and-base-component-l
git reset --hard origin/dev
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-59): bring in WINE-187 foundation primitives"
```

Sanity test + force-push.

---

## 2. Scope

**In:** `/`, `/dashboard`.

**Out:** `/stats` (separate ticket WINE-188). `/orders` / `/orders/$id` (separate ticket WINE-71). Profile-image upload — owner-forms-ticket.

---

## 3. Architecture decisions

### 3.1 Home page sections

Home is a composite. Compose:
- Hero with tagline + CTA buttons to `/explore` and `/events`.
- `<HomeSection title="Featured wines" viewAllHref="/explore">` — top 3 via `useGetWines({})`.slice(0,3) → `<WineCard>`.
- `<HomeSection title="Featured winemakers" viewAllHref="/winemakers">` — top 3 via `useGetWinemakers({})`.
- `<HomeSection title="Upcoming events" viewAllHref="/events">` — top 3 via `useGetEvents({ status: "approved" })`.
- Footer CTA `<Card variant="section">` "Sell on WineMarket → /dashboard" pushing role-request.

`<HomeSection>` is a thin wrapper similar to `<SearchSection>` from WINE-68. If WINE-68 has `<SearchSection>`, REUSE it — they have the same shape. If WINE-68 hasn't merged, replicate locally and consolidate later.

### 3.2 Dashboard sections

Dashboard is single-page (no tabs, no nested routes). Sections in order:

1. `<DashboardProfileSection>` — edit own profile (name, email-readonly, fname/lname inline edit, addresses subsection). Uses `usePutUsersMe`, `useGetUsersMeAddresses`, `usePostUsersMeAddresses`, `usePutUsersMeAddressesByAddressId`, `useDeleteUsersMeAddressesByAddressId`.
2. `<DashboardRoleSection>` — current roles + Request new role button. Posts to `usePostRoleRequests`.
3. `<DashboardQuickStats>` — small teaser using count-only hits (`?limit=1` returns full list metadata? if not, ignore counts and link directly to `/stats`). Renders 3-4 stat cards using `<Card variant="section">` per role.
4. `<DashboardQuickLinks>` — buttons linking to "My X" filtered views:
   - My orders → `/orders`
   - My wines (winemaker role active) → `/explore?winemakerId=me`
   - My events (winemaker) → `/events?winemakerId=me`
   - My shops (shop_owner) → `/shops?ownerUserId=me`

Existing files in `components/dashboard/`:
- `BundlesListTab.tsx`, `CustomerOrderHistoryTab.tsx`, `DashboardTabs.tsx`, `EventsListTab.tsx`, `MyWines.tsx`, `ProfileEditForm.tsx`, `ShopOwnerInventoryTab.tsx`, `UserInfoCard.tsx`, `WinemakerInventoryTab.tsx`, `statusVariant.ts`, `tabs/`

Decision: the existing tab-based dashboard collapses into a single linear scroll. **Delete** all the `*Tab.tsx` components and the `DashboardTabs` infrastructure. **Keep** `ProfileEditForm`, `UserInfoCard`, `statusVariant.ts` (these are reusable). The new sections (`DashboardProfileSection`, `DashboardRoleSection`, `DashboardQuickStats`, `DashboardQuickLinks`) compose `ProfileEditForm` + `UserInfoCard` internally.

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/home/HomeHero.tsx` | ~50 | Hero block on home page |
| `apps/web/src/components/home/HomeSection.tsx` | ~40 | Section wrapper (reused from SearchSection if available; otherwise local) |
| `apps/web/src/components/home/HomeFeaturedWines.tsx` | ~30 | Fetches top 3 wines, renders section |
| `apps/web/src/components/home/HomeFeaturedWinemakers.tsx` | ~30 | Fetches top 3 winemakers |
| `apps/web/src/components/home/HomeFeaturedEvents.tsx` | ~30 | Fetches top 3 events |
| `apps/web/src/components/dashboard/DashboardProfileSection.tsx` | ~60 | Profile edit + addresses subsection |
| `apps/web/src/components/dashboard/DashboardAddressesList.tsx` | ~80 | Addresses CRUD UI |
| `apps/web/src/components/dashboard/DashboardRoleSection.tsx` | ~60 | Current roles + new-role request form |
| `apps/web/src/components/dashboard/DashboardQuickStats.tsx` | ~50 | Per-role stat teaser cards |
| `apps/web/src/components/dashboard/DashboardQuickLinks.tsx` | ~40 | "My X" buttons by role |
| `apps/web/src/components/home/<name>.test.tsx` (5 files) | ~25 each | |
| `apps/web/src/components/dashboard/<name>.test.tsx` (5 files) | ~25 each | |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/index.tsx` | Replace stub with `<HomeHero>` + 3 featured sections + footer CTA |
| `apps/web/src/routes/_authenticated.dashboard.tsx` | Replace stub with 4 dashboard sections in order |

### 4.3 Delete

| Path | Reason |
|---|---|
| `apps/web/src/components/dashboard/BundlesListTab.tsx` | Tabs collapsed; use quick-links instead |
| `apps/web/src/components/dashboard/CustomerOrderHistoryTab.tsx` | Replaced by quick-link to `/orders` |
| `apps/web/src/components/dashboard/DashboardTabs.tsx` | Tabs collapsed |
| `apps/web/src/components/dashboard/EventsListTab.tsx` | Replaced by quick-link to `/events?winemakerId=me` |
| `apps/web/src/components/dashboard/MyWines.tsx` | Replaced by quick-link to `/explore?winemakerId=me` |
| `apps/web/src/components/dashboard/ShopOwnerInventoryTab.tsx` | Replaced by quick-link |
| `apps/web/src/components/dashboard/WinemakerInventoryTab.tsx` | Replaced by quick-link |
| `apps/web/src/components/dashboard/tabs/` (whole folder) | All subfiles obsolete |

### 4.4 Keep

| Path | Reason |
|---|---|
| `apps/web/src/components/dashboard/ProfileEditForm.tsx` | Used by `DashboardProfileSection` |
| `apps/web/src/components/dashboard/UserInfoCard.tsx` | Used by `DashboardProfileSection` |
| `apps/web/src/components/dashboard/statusVariant.ts` | Likely used by status badges elsewhere; verify and keep if so |

Audit KEEP files for violations (lucide, skeletons, tokens) and migrate in this branch.

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2: Build `<HomeHero>` (TDD)

Simple block, ≥3 tests. Commit: `feat(WINE-59): add HomeHero component`.

### Task 3: Build `<HomeSection>` (TDD)

If `<SearchSection>` is in dev (from WINE-68), re-use by importing. Otherwise create local. ≥3 tests. Commit: `feat(WINE-59): add HomeSection wrapper`.

### Task 4: Build `<HomeFeaturedWines>`

Fetches `useGetWines({})`, slices top 3, renders `<HomeSection>` of `<WineCard>`. Loading/error/empty handled inline (skip section if empty). ≥3 tests. Commit: `feat(WINE-59): add HomeFeaturedWines section`.

### Task 5: Build `<HomeFeaturedWinemakers>`

Same shape as Task 4 with `useGetWinemakers` + `<WinemakerCard>`. ≥3 tests. Commit.

### Task 6: Build `<HomeFeaturedEvents>`

Same shape with `useGetEvents({ status: "approved" })` + `<EventCard>`. ≥3 tests. Commit.

### Task 7: Migrate `/` route

Replace stub with `<HomeHero>` + 3 featured sections + footer CTA. Commit: `feat(WINE-59): migrate / route to cascade pattern`.

### Task 8: Build `<DashboardAddressesList>` (TDD)

List of addresses with Edit/Delete inline + "Add address" button opening shadcn `<Dialog>` with `<AddressForm>` (reuse the existing `routes/-components/cart/AddressForm.tsx` — migrate it to `components/forms/` first if it isn't generic). ≥5 tests. Commit: `feat(WINE-59): add DashboardAddressesList`.

### Task 9: Build `<DashboardProfileSection>` (TDD)

Composes `<UserInfoCard>` (existing) + `<ProfileEditForm>` (existing) + `<DashboardAddressesList>`. Layout: name/email at the top, inline edit affordances; addresses block below. ≥3 tests. Commit: `feat(WINE-59): add DashboardProfileSection`.

### Task 10: Build `<DashboardRoleSection>` (TDD)

Current roles badges + form to request a new role (Select of `winemaker`/`shop_owner` + Submit posts `usePostRoleRequests`). If user already has a pending role-request, show its status instead of the form. ≥5 tests. Commit: `feat(WINE-59): add DashboardRoleSection`.

### Task 11: Build `<DashboardQuickStats>` (TDD)

Renders 3-4 small `<Card variant="section">` per role. Each card has a label + a value + a "View full stats" link to `/stats`. Stats values: customer = orders count (length of `useGetOrders` if exists, else "—"), winemaker = wine count, shop_owner = shops count. Use `?limit=1` if BE supports headers; else just show "—" placeholder linked to `/stats`. ≥3 tests. Commit: `feat(WINE-59): add DashboardQuickStats teaser`.

### Task 12: Build `<DashboardQuickLinks>` (TDD)

4 buttons gated by `useUser().activeRole`. ≥4 tests (one per role variant). Commit: `feat(WINE-59): add DashboardQuickLinks`.

### Task 13: Migrate `/dashboard` route

Replace stub with the 4 sections in order. Use `<Section heading>` wrappers. Commit: `feat(WINE-59): migrate /dashboard route to cascade pattern`.

### Task 14: Delete obsolete dashboard files

```
git rm apps/web/src/components/dashboard/BundlesListTab.tsx
git rm apps/web/src/components/dashboard/CustomerOrderHistoryTab.tsx
git rm apps/web/src/components/dashboard/DashboardTabs.tsx
git rm apps/web/src/components/dashboard/EventsListTab.tsx
git rm apps/web/src/components/dashboard/MyWines.tsx
git rm apps/web/src/components/dashboard/ShopOwnerInventoryTab.tsx
git rm apps/web/src/components/dashboard/WinemakerInventoryTab.tsx
git rm -r apps/web/src/components/dashboard/tabs/
```

Verify nothing else imports from these (typecheck will catch). Commit: `chore(WINE-59): remove obsolete dashboard tab components`.

### Task 15: Audit KEEP files

`ProfileEditForm.tsx`, `UserInfoCard.tsx`, `statusVariant.ts`. Migrate violations. Commit.

### Task 16: Final verification

Manual sweep:
- `/` as guest
- `/` as signed-in user
- `/dashboard` as each role (customer, winemaker, shop_owner, admin)
- Profile edit + address add/edit/delete works
- Role-request submit works
- Dark mode parity

---

## 6. Per-route layout descriptions

### 6.1 `/`

- `<HomeHero>` — full-width title, subtitle, two CTA buttons (Explore wines / Find events). Background a soft `bg-secondary/20` block.
- `<HomeFeaturedWines>` section.
- `<HomeFeaturedWinemakers>` section.
- `<HomeFeaturedEvents>` section.
- Footer CTA: `<Card variant="section">` with text "Want to sell wine here?" + button to `/dashboard` (signed-in) or `/auth/register` (signed-out).

### 6.2 `/dashboard`

- `<PageHeader title={user.fname + " " + user.lname} description={user.email} />`
- `<Section heading="Profile">` containing `<DashboardProfileSection>`
- `<Section heading="Roles">` containing `<DashboardRoleSection>`
- `<Section heading="Your activity">` containing `<DashboardQuickStats>`
- `<Section heading="Quick links">` containing `<DashboardQuickLinks>`

---

## 7. Verification gates

Same as WINE-68 §7.

---

## 8. Risks and open decisions

- **Address form reuse.** `routes/-components/cart/AddressForm.tsx` was built for checkout. It may have cart-specific assumptions (e.g. only shipping addresses). Audit before reuse. If not generic, leave it in place and build a new `AddressForm` for the dashboard.
- **Role-request UI assumes a 1-pending-request limit.** If the BE allows multiple pending requests, the section needs a list view. Verify spec.
- **No order count on the customer card.** `useGetOrders` is missing per page-stubs audit. Use "—" placeholder until BE backlog resolves.
- **`<DashboardQuickStats>` is a teaser only.** Full breakdown is `/stats` (WINE-188).

---

## 9. Success criteria

1. 10 new component files (+ 10 tests).
2. `/` and `/dashboard` use cascade orchestrators.
3. 8 obsolete dashboard tab files deleted.
4. KEEP files audit-clean.
5. Tests + typecheck + biome all green.
6. Adam visually confirms `/` and `/dashboard` across roles.
7. Branch has ≥16 commits prefixed `feat(WINE-59):` / `refactor(WINE-59):` / `chore(WINE-59):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely:
- `useGetOrdersMe` or `useGetOrders` for customer order count
- `?limit=1` filter support on list endpoints (for cheap counts)
- `useGetRoleRequestsMe` for showing current request status
