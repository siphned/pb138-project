# WINE-70 — Shops Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace page stubs on `/shops` and `/shops/$id` with real UI. Add owner-conditional Edit/Manage menu on `/shops/$id`. Reuse the cascade pattern and primitive layer established in WINE-187 and WINE-68.

**Architecture:** Same cascade pattern as WINE-68. Routes are thin orchestrators; domain components live in `apps/web/src/components/shops/` (new folder) and reuse `<ProductCard>` from `components/catalog/` for product sub-grids inside shop detail. Owner Manage menu surfaces but does NOT implement the nested owner-only routes (`/shops/$id/inventory`, `/shops/$id/orders`, etc.) — those belong to the owner-forms ticket.

**Tech Stack:** Same as WINE-68 (`docs/plans/2026-05-12-WINE-68-catalog-cluster.md`).

**Predecessors:** WINE-187 (primitives) merged. WINE-68 (catalog) is NOT a hard predecessor but provides `<ProductCard>` which this plan reuses; if WINE-68 has merged to dev first, `<ProductCard>` is available; otherwise replicate the import path expectations and have WINE-68's PR merge before this one (see §11).

---

## Hard rules

Identical to WINE-68 §"Hard rules". Read that section first. Conventional commit prefix here: `feat(WINE-70):` / `refactor(WINE-70):` / `chore(WINE-70):`.

---

## 1. Branch bootstrap

```powershell
git fetch origin
git checkout WINE-70-build-shop-pages-and-product-detail-pages
git reset --hard origin/dev
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-70): bring in WINE-187 foundation primitives"
```

If WINE-68 has merged to dev before this work starts, `<ProductCard>` is automatically present after the reset. Otherwise add it manually (or cherry-pick from WINE-68) — see §11.

Verify: `bun run --filter web test --run` and `bun run --filter web check-types` exit 0. Force-push with `--force-with-lease`.

---

## 2. Scope

**In:** `/shops`, `/shops/$id` routes; new domain components in `components/shops/`; owner Manage menu surfacing nested-route links (the nested routes themselves stay as stubs until WINE-180 owner-forms).

**Out:** Any of the nested `/shops/$id/{edit,images,availability,inventory,orders,supply-browse,supply-incoming}` routes. Those are owner-forms-ticket scope. Stubs already exist on dev — leave them alone here.

**Note on product detail:** WINE-68 covers `/products/$productId`. WINE-70 does NOT touch it. The "shop-pages-and-product-detail-pages" branch name predates the WINE-68/WINE-70 split.

---

## 3. Architecture decisions

### 3.1 New folder `components/shops/`

Sibling to `components/catalog/`. Contains `ShopCard` (currently in `components/catalog/` — moved here because shops aren't catalog), `ShopHero`, `ShopDetailsCard`, `ShopProductsGrid`, `ShopManageMenu`.

Move plan:
- `components/catalog/ShopCard.tsx` → `components/shops/ShopCard.tsx`
- Update all importers in this branch.

If the move conflicts with anything WINE-68 merged first, resolve by accepting WINE-70's new path and adding a re-export shim in `components/catalog/ShopCard.tsx`: `export { ShopCard } from "@/components/shops/ShopCard";`. Plan to delete the shim in a follow-up.

### 3.2 Reuse `<CatalogFilters>` from WINE-68

`/shops` filter uses `<CatalogFilters entity="shops">` — extend WINE-68's `CatalogFilters` to accept a new `entity="shops"` variant: q + city + ownerUserId-of-me toggle. If WINE-68 hasn't merged yet, replicate the component locally; reconcile in PR review.

### 3.3 Owner Manage menu

`<ShopManageMenu>` is a dropdown (shadcn `<DropdownMenu>`) with items linking to nested owner routes. Renders only when `<ShowOwner ownerUserId={shop.ownerUserId}>` is satisfied. Items:

- Edit shop → `/shops/$id/edit`
- Manage images → `/shops/$id/images`
- Manage availability → `/shops/$id/availability`
- Manage inventory → `/shops/$id/inventory`
- Incoming orders → `/shops/$id/orders`
- Supply agreements → `/shops/$id/supply-browse`

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/shops/ShopCard.tsx` | ~50 | Single shop catalog card (moved from `components/catalog/`) |
| `apps/web/src/components/shops/ShopHero.tsx` | ~40 | Shop name + cover image + address summary on `/shops/$id` |
| `apps/web/src/components/shops/ShopDetailsCard.tsx` | ~70 | Description + contact (`<DescriptionList>`) + open hours card |
| `apps/web/src/components/shops/ShopProductsGrid.tsx` | ~30 | Wrapper rendering `<DataGrid variant="catalog">` of `<ProductCard>` for products from `useGetShopsByIdProducts` |
| `apps/web/src/components/shops/ShopManageMenu.tsx` | ~40 | Owner-gated dropdown with management links |
| `apps/web/src/components/shops/<name>.test.tsx` (5 files) | ~25 each | One test file per component |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/shops.index.tsx` | Replace stub with `/explore`-style orchestrator using `<CatalogFilters entity="shops">` + `<DataGrid>` of `<ShopCard>` |
| `apps/web/src/routes/shops.$id.tsx` | Replace stub with `<ShopHero>` + `<ShopDetailsCard>` + `<ShopProductsGrid>` + `<ShopManageMenu>` (owner-gated) |
| `apps/web/src/components/catalog/CatalogFilters.tsx` (if WINE-68 already merged) | Add `entity="shops"` variant |

### 4.3 Audit pass on existing route-private shop files (KEEP, migrate violations)

| File | Decision |
|---|---|
| `routes/-components/ShopContactCard.tsx` | KEEP, migrate violations (likely absorb into `ShopDetailsCard` later; for now refactor in place) |
| `routes/-components/ShopGalleryDesktop.tsx` | KEEP, migrate violations |
| `routes/-components/ShopGalleryMobile.tsx` | KEEP, migrate violations |
| `routes/-components/ShopGalleryThumbnailStrip.tsx` | KEEP, migrate violations |
| `routes/-components/ShopHeroGallery.tsx` | KEEP, migrate violations (call from `<ShopHero>`) |
| `routes/-components/ShopHoursDisplay.tsx` | KEEP, migrate violations (call from `<ShopDetailsCard>`) |
| `routes/-components/ShopInfoPanel.tsx` | KEEP, migrate violations |
| `routes/-components/ShopMapEmbed.tsx` | KEEP, migrate violations |
| `routes/-components/ShopProductsSection.tsx` | DELETE; replaced by `<ShopProductsGrid>` |
| `routes/-components/ShopBundlesSection.tsx` | DELETE; bundles are products with `isBundle=true`, already in `<ShopProductsGrid>` |

---

## 5. Tasks

Branch ops: Task 1 (§1).
New domain components TDD'd: Tasks 2-6.
Route migrations: Tasks 7-8.
Audit pass on KEEP files: Task 9.
Delete obsolete files: Task 10.
Final verification: Task 11.

For TDD patterns, refer to WINE-68 Task 2 verbatim — same shape applies to every new component here. Same PowerShell test/typecheck/commit loop.

### Task 1: Branch bootstrap

See §1.

### Task 2: Move + refactor `<ShopCard>` to `components/shops/`

`git mv apps/web/src/components/catalog/ShopCard.tsx apps/web/src/components/shops/ShopCard.tsx`. Update imports across the codebase. Add `ShopCard.test.tsx` (≥3 tests). Commit: `refactor(WINE-70): move ShopCard to components/shops/`.

### Task 3: Create `<ShopHero>`

Props: `shop` (from `useGetShopsById`). Calls existing `<ShopHeroGallery>` for image. ≥3 tests. Commit: `feat(WINE-70): add ShopHero component`.

### Task 4: Create `<ShopDetailsCard>`

Composes `<DescriptionList>` for address/contact + `<ShopHoursDisplay>` (existing). Renders `<ShopManageMenu>` (next task) inside `<ShowOwner>`. ≥4 tests. Commit: `feat(WINE-70): add ShopDetailsCard component`.

### Task 5: Create `<ShopProductsGrid>`

Fetches `useGetShopsByIdProducts({ shopId, isBundle })`. Renders `<LoadingState variant="catalog">` / `<ErrorState>` / `<EmptyState>` / `<DataGrid>` of `<ProductCard>`. ≥4 tests covering each state. Commit: `feat(WINE-70): add ShopProductsGrid`.

### Task 6: Create `<ShopManageMenu>`

Shadcn `<DropdownMenu>` with 6 items (see §3.3). Wraps content in `<ShowOwner ownerUserId={shop.ownerUserId}>`. ≥3 tests: renders when owner, doesn't render otherwise, items have correct hrefs. Commit: `feat(WINE-70): add ShopManageMenu owner-gated dropdown`.

### Task 7: Migrate `/shops` route

Canonical orchestrator (WINE-68 §3.1). Filter: `entity="shops"`. Cards: `<ShopCard>`. Commit: `feat(WINE-70): migrate /shops route to cascade pattern`.

### Task 8: Migrate `/shops/$id` route

Replace stub with `<ShopHero>` + `<ShopDetailsCard>` + `<ShopProductsGrid shopId={id}>`. Owner menu surfaces via `<ShopManageMenu>` (gated). Commit: `feat(WINE-70): migrate /shops/$id route to cascade pattern`.

### Task 9: Audit pass on KEEP files

Same loop as WINE-68 Task 18. Commit per ~3 files or one final commit if all changes are small.

### Task 10: Delete obsolete files

```
git rm apps/web/src/routes/-components/ShopProductsSection.tsx
git rm apps/web/src/routes/-components/ShopBundlesSection.tsx
```

Verify typecheck. Commit: `chore(WINE-70): remove obsolete shop section components`.

### Task 11: Final verification

Same shape as WINE-68 Task 20. Manual sweep:
- `/shops`
- `/shops/<id>` as guest (no Manage menu) and as the owner of that shop (Manage menu visible)
- Light + dark theme on both.

---

## 6. Per-route layout descriptions (used when figma PNG is missing)

### 6.1 `/shops`

- `<PageHeader title="Shops" description="Browse independent wine shops." />`
- Two-column from `lg:`: filters (`<CatalogFilters entity="shops">` with q + city) + `<DataGrid>` of `<ShopCard>`.

### 6.2 `/shops/$id`

- Back link "← Shops" → `/shops`.
- `<ShopHero>` — cover image carousel via `<ShopHeroGallery>` + title row + `<ShopManageMenu>` (gated) on the right.
- Two-column from `lg:`: left main column has `<ShopDetailsCard>` (description + contact + hours). Right rail: `<ShopMapEmbed>` (existing).
- `<Section heading="Products">` containing `<ShopProductsGrid shopId={id}>`.

---

## 7. Verification gates

Same table as WINE-68 §7 (web tests, typecheck, biome, manual sweep).

---

## 8. Risks and open decisions

- **`ShopCard` move may conflict with WINE-68.** If both branches edit imports, resolve by accepting both — the shim in §3.1 covers fallback.
- **`<CatalogFilters entity="shops">` extension belongs in catalog folder, edited from this branch.** That's a cross-cluster touch. If WINE-68 hasn't merged yet, the change is on a different branch — coordinate merge order.
- **Manage menu items target nested routes that are still stubs.** Clicking "Manage inventory" sends the user to a stub page. Acceptable: the goal of this ticket is the public-facing shop detail, not nested management. WINE-180 lights up the targets.

---

## 9. Success criteria

1. 5 new files in `components/shops/` (+ 5 tests).
2. `/shops` and `/shops/$id` use the canonical orchestrator.
3. 2 obsolete files deleted; 8 KEEP files audit-clean.
4. Tests + typecheck + biome all green.
5. Adam visually confirms both routes.
6. Branch has ≥11 commits prefixed `feat(WINE-70):` / `refactor(WINE-70):` / `chore(WINE-70):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Examples likely to appear:
- `useGetShops?q=`, `?city=`, `?ownerUserId=` not respected
- `useGetShopsByIdProducts?isBundle=` not respected

---

## 11. Cross-ticket coordination

If WINE-68 merges to dev BEFORE this work starts: nothing to do; `<ProductCard>` and `<CatalogFilters>` are available.

If WINE-70 starts BEFORE WINE-68 merges:
- Replicate `<ProductCard>` and `<CatalogFilters>` locally OR cherry-pick the relevant commits from origin/WINE-68.
- Coordinate with WINE-68 author so the eventual merge is clean (this likely means one PR re-bases on the other).

Adam decides merge order at PR-review time.
