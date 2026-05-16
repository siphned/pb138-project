# WINE-188 — Statistics Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stub on `/stats` with role-aware analytics page. Same URL for everyone; content branches on `activeRole` from `useUser()`. Customer / winemaker / shop_owner / admin each see their own widget set.

**Architecture:** Single route file orchestrates 4 role-specific section components in `apps/web/src/components/stats/`. Each section composes `<Card variant="section">` "stat tiles" displaying a label + a number. Numbers come from BE aggregate endpoint(s) — or, as a fallback while BE catches up, from FE-side composition of existing list hooks (count by `data.length`, sum by manual map-reduce — cheap for small datasets, terrible for large but acceptable for a school project at week 8).

**Tech Stack:** Same as WINE-189.

**Predecessors:** WINE-187 merged. **BE-blocked unless using FE composition fallback** — see §3.2.

---

## Hard rules

Identical to WINE-189 §"Hard rules". Conventional commit prefix here: `feat(WINE-188):` / `refactor(WINE-188):` / `chore(WINE-188):`.

---

## 1. Branch bootstrap

Branch `WINE-188-implement-statistic-pages` exists locally clean.

```powershell
git fetch origin
git checkout WINE-188-implement-statistic-pages
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-188): bring in WINE-187 foundation primitives"
bun run --filter web test --run
bun run --filter web check-types
git push -u origin WINE-188-implement-statistic-pages
```

Once WINE-187 lands in dev, the merge is unnecessary.

---

## 2. Scope

**In:** `/stats` for all 4 roles (customer, winemaker, shop_owner, admin) using FE composition where BE is missing.

**Out:** New BE endpoints. Visitor count / Google Analytics integration.

---

## 3. Architecture decisions

### 3.1 Single route, 4 sections

`apps/web/src/routes/_authenticated.stats.tsx`:

```tsx
function StatsPage() {
  const { activeRole } = useUser();
  return (
    <div className="container ...">
      <PageHeader title="Statistics" />
      {activeRole === "customer" && <CustomerStatsSection />}
      {activeRole === "winemaker" && <WinemakerStatsSection />}
      {activeRole === "shop_owner" && <ShopOwnerStatsSection />}
      {activeRole === "admin" && <AdminStatsSection />}
    </div>
  );
}
```

### 3.2 Data sourcing strategy (FE-first fallback)

For each stat, prefer a dedicated BE aggregator if one exists. Otherwise compose from existing list hooks. Composition is fine for week-8 dataset sizes (everything <500 rows).

| Role | Stat | BE aggregator (preferred) | FE fallback |
|---|---|---|---|
| Customer | Orders count | (none known) | `useGetOrders().data?.length` (BE may need this list hook — flag) |
| Customer | Total spent | (none) | sum of `data.totalPrice` |
| Customer | Events attended | (none) | `useGetEventRegistrations` if exists; else "—" |
| Customer | Reviews written | (none) | needs `useGetReviewsMe` — flag for BE |
| Winemaker | Wine catalog count | (none) | `useGetWines({ winemakerId: "me" }).data?.length` |
| Winemaker | Total stock | (none) | sum of `wine.quantity` |
| Winemaker | Events created (by status) | (none) | `useGetEvents({ winemakerId: "me" })`.filter |
| Winemaker | Supply agreements | (none) | `useGetSupplyAgreementsWinemaker` |
| Shop owner | Shops count | (none) | `useGetShops({ ownerUserId: "me" }).data?.length` |
| Shop owner | Products (regular / bundle) | (none) | per-shop iterate `useGetShopsByIdProducts` |
| Shop owner | Total stock value | (none) | sum of `price * quantity` |
| Shop owner | Orders processed | (none) | needs `useGetOrdersByShopId` — flag |
| Shop owner | Revenue | (none) | requires orderItems sum — flag |
| Admin | Users count by role | (none) | `useGetAdminUsers().data?.filter(r => r.role)` |
| Admin | Total revenue | (none) | likely needs new BE |
| Admin | Pending role requests | (none) | `useGetRoleRequests({ status: "pending" }).data?.length` |
| Admin | Pending events | (none) | `useGetAdminEvents({ status: "pending" }).data?.length` |

For every "needs X — flag" cell, add a row to §10 BE backlog and render the stat tile with value "—" (em-dash) and a `<small>BE backlog</small>` annotation.

### 3.3 Stat tile primitive

A single reusable atom:

```tsx
// apps/web/src/components/stats/StatTile.tsx
interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
}
```

Renders `<Card variant="section">` with the label muted on top, value large below, hint smaller below value. Grid of stat tiles uses `<DataGrid variant="gallery">` (4-col on lg).

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/stats/StatTile.tsx` | ~25 | Single tile |
| `apps/web/src/components/stats/CustomerStatsSection.tsx` | ~50 | 4 tiles for customer role |
| `apps/web/src/components/stats/WinemakerStatsSection.tsx` | ~70 | 4-5 tiles for winemaker role |
| `apps/web/src/components/stats/ShopOwnerStatsSection.tsx` | ~80 | 5 tiles for shop_owner role |
| `apps/web/src/components/stats/AdminStatsSection.tsx` | ~70 | 4-6 tiles for admin role |
| `apps/web/src/components/stats/<name>.test.tsx` (5 files) | ~25 each | |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/_authenticated.stats.tsx` | Replace stub with role-branched orchestrator |

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2: Build `<StatTile>` (TDD)

Simple, ≥3 tests. Commit: `feat(WINE-188): add StatTile primitive`.

### Task 3-6: Build the 4 role sections (one task per role)

Each task: TDD a `<XxxStatsSection>` that fetches the role's hooks, composes 4-5 `<StatTile>`. Use `<LoadingState variant="catalog">` while pending. `<DataGrid variant="gallery">` to lay out tiles. ≥4 tests per section. Commit per section.

### Task 7: Migrate `/stats` route

Replace stub with role-branch orchestrator. Empty-active-role fallback: render `<EmptyState message="Sign in to see your stats">`. Commit: `feat(WINE-188): migrate /stats route to role-branched cascade`.

### Task 8: Final verification

Manual sweep:
- `/stats` as customer (4 tiles, BE-missing tiles show "—")
- `/stats` as winemaker (different tiles)
- `/stats` as shop_owner
- `/stats` as admin
- Light + dark theme

---

## 6. Per-section descriptions

### 6.1 Customer

Tiles: "Orders", "Total spent", "Events attended", "Reviews written".

### 6.2 Winemaker

Tiles: "Wines in catalog", "Total stock", "Events created", "Supply agreements", "Average review score".

### 6.3 Shop owner

Tiles: "Shops", "Products", "Bundles", "Total stock value", "Orders processed", "Revenue".

### 6.4 Admin

Tiles: "Users (total)", "Pending role requests", "Pending events", "Flagged reviews", "Total products", "Total shops".

---

## 7. Verification gates

Same as WINE-189 §7, MINUS visual sweep for non-default roles if Clerk test users for those roles aren't set up — substitute by manually flipping `useUser().activeRole` via UserContext setter (`setActiveRole`) in the dev environment.

---

## 8. Risks and open decisions

- **Many BE gaps.** Every cell marked "needs X — flag" in §3.2 produces a "—" tile until BE delivers. Acceptable for week-8 milestone; bad for production. Adam decides whether to ship with `—` tiles or block this ticket on the BE backlog.
- **FE composition perf.** For datasets >5k rows, computing sums on FE is a non-starter. Demo data is small enough today. Note in §10 BE backlog: per-role aggregator endpoint is the long-term solution.
- **Role-switch UX.** `useUser().activeRole` flips via the Sidebar role switcher; the stats page re-renders to the new role's section. Confirm this works without a hard refresh.

---

## 9. Success criteria

1. 5 new files in `components/stats/` (+ 5 tests).
2. `/stats` renders the correct section for each role.
3. Tests + typecheck + biome all green.
4. Adam confirms each role variant.
5. Branch has ≥7 commits prefixed `feat(WINE-188):` / `chore(WINE-188):`.

---

## 10. BE backlog handed off

Every "needs X — flag" cell from §3.2 becomes one row here, populated during execution. Example template:

| Need | Hook name | Used by |
|---|---|---|
| Per-role aggregator endpoint | `useGetStatsMe` (new) | every section, replaces FE composition |
| Customer order list | `useGetOrders` or `useGetOrdersMe` | Customer Orders / Total spent tiles |
| Reviews by user | `useGetReviewsMe` | Customer Reviews tile |
| Event registrations by user | `useGetEventRegistrationsMe` | Customer Events tile |
| Orders by shop | `useGetOrdersByShopId` | Shop owner Orders tile |
| Revenue by shop / globally | new aggregator | Shop owner Revenue, Admin Total revenue |

Adam ships these to BE via Jira after the ticket lands.
