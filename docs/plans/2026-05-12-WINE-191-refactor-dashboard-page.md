# WINE-191 — Home Page + Dashboard Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stubs on `/` (composite homepage) and `/dashboard` (authenticated user hub) with real UI. WINE-191 owns the dashboard SHELL (home page + role section + quick-stats teaser + quick-links). The profile management UI (`<DashboardProfileSection>`, `<DashboardAddressesList>`) is owned by WINE-73 and imported here.

**Architecture:** Same cascade pattern. New domain components in `apps/web/src/components/home/` and `apps/web/src/components/dashboard/`. Home page composes featured slices via existing list hooks limited to ~3 items each.

**Tech Stack:** Same as WINE-189.

**Predecessors:**
- WINE-187 (primitives) merged — hard predecessor.
- WINE-73 (orders + profile) — SOFT predecessor. WINE-191 imports `<DashboardProfileSection>` from WINE-73's territory; if WINE-73 hasn't merged when WINE-191 starts, leave a `<Card>TODO: profile section from WINE-73</Card>` placeholder and finish via PR comment after WINE-73 lands.

---

## Hard rules

Identical to WINE-189 §"Hard rules". Conventional commit prefix here: `feat(WINE-191):` / `refactor(WINE-191):` / `chore(WINE-191):`.

---

## 1. Branch bootstrap

Branch `WINE-191-refactor-dashboard-page` exists locally clean.

```powershell
git fetch origin
git checkout WINE-191-refactor-dashboard-page
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-191): bring in WINE-187 foundation primitives"
bun run --filter web test --run
bun run --filter web check-types
git push -u origin WINE-191-refactor-dashboard-page
```

Once WINE-187 lands in dev, the merge step is unnecessary.

---

## 2. Scope

**In:** `/`, `/dashboard` (shell). New components for home featured sections + dashboard role / quick-stats / quick-links.

**Out:**
- Profile management UI (edit profile, addresses CRUD) — owned by WINE-73.
- `/stats` full analytics — owned by WINE-188.
- `/orders` / `/orders/$id` — owned by WINE-73.

---

## 3. Architecture decisions

### 3.1 Home page sections

Compose:
- `<HomeHero>` with tagline + CTA buttons to `/explore` and `/events`.
- `<HomeFeaturedWines>` — top 3 via `useGetWines({})`.slice(0,3) → `<WineCard>`.
- `<HomeFeaturedWinemakers>` — top 3 via `useGetWinemakers({})`.
- `<HomeFeaturedEvents>` — top 3 via `useGetEvents({ status: "approved" })`.
- Footer CTA `<Card variant="section">` "Sell on WineMarket → /dashboard".

`<HomeSection>` is a thin wrapper similar to `<SearchSection>` from WINE-189 — REUSE `<SearchSection>` directly if available, otherwise build local `<HomeSection>` and consolidate later.

### 3.2 Dashboard sections (linear scroll, no tabs)

Order in the route file:

1. `<DashboardProfileSection>` — **IMPORTED FROM WINE-73**. Don't build it here. If WINE-73 hasn't landed, render `<Card variant="section">Profile section coming in WINE-73</Card>` placeholder.
2. `<DashboardRoleSection>` — built here. Current roles badges + new-role request form via `usePostRoleRequests`.
3. `<DashboardQuickStats>` — built here. Per-role 3-4 stat tiles with "View full stats" link to `/stats`.
4. `<DashboardQuickLinks>` — built here. Role-aware buttons to "My X" filtered views.

### 3.3 Existing dashboard files — delete the tab system

Existing files in `apps/web/src/components/dashboard/`:
- `BundlesListTab.tsx`, `CustomerOrderHistoryTab.tsx`, `DashboardTabs.tsx`, `EventsListTab.tsx`, `MyWines.tsx`, `ShopOwnerInventoryTab.tsx`, `WinemakerInventoryTab.tsx`, `tabs/` folder, `statusVariant.ts`.

**Delete** all `*Tab.tsx` and `DashboardTabs.tsx` and the `tabs/` folder. Tab UX replaced by linear scroll + quick-links.

**`ProfileEditForm.tsx` and `UserInfoCard.tsx`:** these existed for the tabbed profile editor. WINE-73 will rebuild profile editing under `components/profile/`. Decision: **delete them here**, let WINE-73 own the rewrite. If WINE-73 wants to start from the existing files, it can git-checkout them from a prior commit. Cleaner separation.

**Keep `statusVariant.ts`** — used by status badges across the app; verify usage before deciding.

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/home/HomeHero.tsx` | ~50 | Hero block |
| `apps/web/src/components/home/HomeSection.tsx` | ~40 | Section wrapper (reuse `<SearchSection>` if WINE-189 merged) |
| `apps/web/src/components/home/HomeFeaturedWines.tsx` | ~30 | Top-3 wines section |
| `apps/web/src/components/home/HomeFeaturedWinemakers.tsx` | ~30 | Top-3 winemakers section |
| `apps/web/src/components/home/HomeFeaturedEvents.tsx` | ~30 | Top-3 events section |
| `apps/web/src/components/dashboard/DashboardRoleSection.tsx` | ~60 | Roles + new-role request |
| `apps/web/src/components/dashboard/DashboardQuickStats.tsx` | ~50 | Per-role teaser tiles |
| `apps/web/src/components/dashboard/DashboardQuickLinks.tsx` | ~40 | "My X" buttons |
| `apps/web/src/components/home/<name>.test.tsx` (5 files) | ~25 each | |
| `apps/web/src/components/dashboard/<name>.test.tsx` (3 files) | ~25 each | |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/index.tsx` | Replace stub with `<HomeHero>` + 3 featured sections + footer CTA |
| `apps/web/src/routes/_authenticated.dashboard.tsx` | Replace stub with 4 dashboard sections in order |

### 4.3 Delete

| Path | Reason |
|---|---|
| `apps/web/src/components/dashboard/BundlesListTab.tsx` | Tab system removed |
| `apps/web/src/components/dashboard/CustomerOrderHistoryTab.tsx` | Replaced by quick-link to `/orders` (WINE-73) |
| `apps/web/src/components/dashboard/DashboardTabs.tsx` | Tab system removed |
| `apps/web/src/components/dashboard/EventsListTab.tsx` | Replaced by quick-link |
| `apps/web/src/components/dashboard/MyWines.tsx` | Replaced by quick-link |
| `apps/web/src/components/dashboard/ShopOwnerInventoryTab.tsx` | Replaced by quick-link |
| `apps/web/src/components/dashboard/WinemakerInventoryTab.tsx` | Replaced by quick-link |
| `apps/web/src/components/dashboard/tabs/` (whole folder) | All subfiles obsolete |
| `apps/web/src/components/dashboard/ProfileEditForm.tsx` | WINE-73 owns profile rewrite |
| `apps/web/src/components/dashboard/UserInfoCard.tsx` | WINE-73 owns profile rewrite |

### 4.4 Keep

| Path | Reason |
|---|---|
| `apps/web/src/components/dashboard/statusVariant.ts` | Used by status badges; verify usage and keep if so |

Audit KEEP file for violations.

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2-6: Build home page components (one task each, TDD)

`<HomeHero>`, `<HomeSection>` (if not reused), `<HomeFeaturedWines>`, `<HomeFeaturedWinemakers>`, `<HomeFeaturedEvents>`. ≥3 tests each. Commits: `feat(WINE-191): add <name> component`.

### Task 7: Migrate `/` route

Replace stub with `<HomeHero>` + 3 featured sections + footer CTA. Commit: `feat(WINE-191): migrate / route to cascade pattern`.

### Task 8: Build `<DashboardRoleSection>` (TDD)

Roles badges + new-role request form. If user already has a pending role-request, show its status. ≥5 tests. Commit: `feat(WINE-191): add DashboardRoleSection`.

### Task 9: Build `<DashboardQuickStats>` (TDD)

Per-role tiles + "View full stats" link to `/stats`. Stats values: customer = orders count via `useGetOrders` (or `—` placeholder if BE missing), winemaker = wine count, shop_owner = shops count. ≥3 tests. Commit: `feat(WINE-191): add DashboardQuickStats teaser`.

### Task 10: Build `<DashboardQuickLinks>` (TDD)

4 buttons gated by `useUser().activeRole`. ≥4 tests (one per role variant). Commit: `feat(WINE-191): add DashboardQuickLinks`.

### Task 11: Migrate `/dashboard` route

Replace stub with the 4 sections in order. Section 1 imports `<DashboardProfileSection>` from `@/components/profile/`. If file doesn't exist yet (WINE-73 hasn't landed), import will fail — render a placeholder `<Card variant="section">` instead and flag in commit message: `feat(WINE-191): migrate /dashboard route — profile section pending WINE-73`.

### Task 12: Delete obsolete dashboard files

```powershell
git rm apps/web/src/components/dashboard/BundlesListTab.tsx
git rm apps/web/src/components/dashboard/CustomerOrderHistoryTab.tsx
git rm apps/web/src/components/dashboard/DashboardTabs.tsx
git rm apps/web/src/components/dashboard/EventsListTab.tsx
git rm apps/web/src/components/dashboard/MyWines.tsx
git rm apps/web/src/components/dashboard/ShopOwnerInventoryTab.tsx
git rm apps/web/src/components/dashboard/WinemakerInventoryTab.tsx
git rm apps/web/src/components/dashboard/ProfileEditForm.tsx
git rm apps/web/src/components/dashboard/UserInfoCard.tsx
git rm -r apps/web/src/components/dashboard/tabs/
```

Verify typecheck. Commit: `chore(WINE-191): remove obsolete dashboard tab + profile components`.

### Task 13: Final verification

Manual sweep:
- `/` as guest
- `/` as signed-in user
- `/dashboard` as each role (customer, winemaker, shop_owner, admin)
- Profile section shows placeholder or imported WINE-73 component
- Role-request submit works
- Dark mode parity

---

## 6. Per-route layout descriptions

### 6.1 `/`

- `<HomeHero>` — full-width title, subtitle, two CTA buttons. Soft `bg-secondary/20` background.
- `<HomeFeaturedWines>` section.
- `<HomeFeaturedWinemakers>` section.
- `<HomeFeaturedEvents>` section.
- Footer CTA `<Card variant="section">` → `/dashboard` (signed-in) or `/auth/register` (signed-out).

### 6.2 `/dashboard`

- `<PageHeader title={user.fname + " " + user.lname} description={user.email} />`
- `<Section heading="Profile">` containing `<DashboardProfileSection>` (from WINE-73 — placeholder until landed)
- `<Section heading="Roles">` containing `<DashboardRoleSection>`
- `<Section heading="Your activity">` containing `<DashboardQuickStats>`
- `<Section heading="Quick links">` containing `<DashboardQuickLinks>`

---

## 7. Verification gates

Same as WINE-189 §7.

---

## 8. Risks and open decisions

- **WINE-73 dependency.** Profile section is a placeholder until WINE-73 ships. Acceptable for week-8 milestone if WINE-73 lands close in time.
- **Role-request UI assumes 1-pending-request limit.** If BE allows multiple pending requests, the section needs a list view. Verify.
- **No order count on customer quick-stats tile.** Use `—` placeholder until BE delivers `useGetOrders` / `useGetOrdersMe`.

---

## 9. Success criteria

1. 8 new component files (+ 8 tests).
2. `/` and `/dashboard` use cascade orchestrators.
3. 10 obsolete files deleted.
4. Tests + typecheck + biome all green.
5. Adam visually confirms `/` and `/dashboard` across roles.
6. Branch has ≥12 commits prefixed `feat(WINE-191):` / `refactor(WINE-191):` / `chore(WINE-191):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely:
- `useGetOrders` or `useGetOrdersMe` for customer order count
- `useGetRoleRequestsMe` for current request status
