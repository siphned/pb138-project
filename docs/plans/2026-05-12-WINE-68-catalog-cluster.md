# WINE-68 — Catalog Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the page stubs on 7 catalog routes (`/explore`, `/wines/$id`, `/products`, `/products/$productId`, `/winemakers`, `/winemakers/$id`, `/search`) with real UI composed via the cascade pattern — routes call 2-5 domain components from `apps/web/src/components/catalog/`, each domain component uses the WINE-187 primitives (`PageHeader`, `Section`, `LoadingState`, `ErrorState`, `EmptyState`, `DescriptionList`/`PropertyRow`, `DataGrid`, `ShowOwner`) inside a `Page → Section → Card → atom` hierarchy.

**Architecture:** Cascade pattern. Routes stay thin — fetch hook + state container fallback + 2-5 domain components. Domain components live in `components/catalog/` and are reused across routes (e.g. `WineCard` appears on `/explore`, `/winemakers/$id`, and `/search`). Owner-conditional UI (Edit/Delete on `/wines/$id` for the wine's winemaker) is gated by `<ShowOwner ownerUserId={…}>`. Filter UI for list pages is a single `<CatalogFilters>` controlled by TanStack Router search params.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui, Base UI, CVA, hugeicons, Vitest 4 + happy-dom + `@testing-library/react`, TanStack Router (file-based with `validateSearch`), TanStack Query (Orval hooks), Clerk via `useUser()`.

**Predecessor:** WINE-187 (Foundation Primitives) MUST be merged into this branch before any task starts.

---

## Hard rules for the implementing agent

You MUST follow every rule below. They override generic React habits.

1. **No new `lucide-react` imports.** Icons in NEW files come from `@hugeicons/react` + `@hugeicons/core-free-icons`. Pattern: `import { ArrowDown01Icon } from "@hugeicons/core-free-icons"; import { HugeiconsIcon } from "@hugeicons/react";` then `<HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />`. See `apps/web/src/components/ui/accordion.tsx`. Existing files keep their lucide — do not touch them in this plan.
2. **No hardcoded colors.** Only semantic tokens: `bg-background`, `bg-card`, `bg-muted`, `bg-primary`, `bg-destructive`, `text-foreground`, `text-muted-foreground`, `border-border`. Forbidden: `bg-gray-*`, `text-black`, `text-white`, `#hex`, `rgb()`. (`CLAUDE.local.md` B2.)
3. **No hand-rolled skeletons.** Use `<LoadingState>` from `@/components/primitives/loading-state` at the route level; use `<Skeleton>` from `@/components/ui/skeleton` for finer-grained placeholders. Forbidden: `animate-pulse` + a `bg-*` div. (B1.)
4. **No inline `style={{}}` for static values.** Tailwind via `cn()`. Inline style only when the value is dynamic and no Tailwind utility fits. (B5.)
5. **Use `cn()` from `@/lib/utils` for all class composition.** Never `+` or template literals on `className`. (B4.)
6. **Cascade discipline.** A route file imports AT MOST 5 domain components. If you find yourself writing JSX with `<div className="...">` blocks inside the route body that aren't a thin layout wrapper, extract them into a named domain component in `components/catalog/`.
7. **Reuse existing domain components in `components/catalog/`.** Inventory: `CatalogCard`, `BundleCard`, `ShopCard`, `FilterSidebar`, `StarRating`, `CatalogPlaceholder`. Plus existing route-private components in `apps/web/src/routes/-components/`: `WineCard`, `WineCatalog`, `WineFiltersSidebar`, `ProductHero`, `ProductInfo`, `ProductGallery`, `ProductReviewsSection`, `ProductSoldAtCard`, `ProductWinemakerCard`, `WinemakerHero`, `WinemakerTabs`, `WinemakerWinesList`, `WinesAvailableInShops`, `BundleContentsList`, `BundleWinesCarousel`, `BundlesContainingWine`, `EntityReviewsSection`. **Read each before deciding to rewrite vs migrate.**
8. **Owner-gated UI via `<ShowOwner>`.** Never branch on roles inline. `<ShowOwner ownerUserId={wine.winemaker.userId}>{...}</ShowOwner>` is the only pattern.
9. **`validateSearch` schemas already exist on every route.** Keep them. They produce typed search params consumed by the catalog hook. Do not delete or rewrite the schema unless adding a new param.
10. **Don't add comments that describe what the code does.** Only one-line WHY comments when non-obvious. (`CLAUDE.md` § "Tone and style".)
11. **Conventional commits.** `feat(WINE-68): …`, `refactor(WINE-68): …`, `test(WINE-68): …`. One commit per route migration (Tasks 4-10) plus one per new domain component (Tasks 2-3).
12. **Figma reference.** Each route has a target design in `docs/figma/<route-name>.png` if Adam has exported it. If the PNG exists, follow it. If not, the per-route §6 description in this plan is the contract.

---

## 1. Branch bootstrap

This plan assumes the implementing agent starts on this branch:

```
WINE-68-build-wine-catalog-page-with-search-and-filters
```

The branch currently contains stale UI work from earlier in the semester. The dev branch has since replaced all catalog routes with page stubs (WINE-171). **Reset this branch to dev + merge primitives + start fresh.** Old work is preserved in git reflog and remote.

- [ ] **Step 1: Fetch + reset to dev**

```powershell
git fetch origin
git checkout WINE-68-build-wine-catalog-page-with-search-and-filters
git reset --hard origin/dev
```

- [ ] **Step 2: Merge primitives**

```powershell
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-68): bring in WINE-187 foundation primitives"
```

Expected: clean merge, no conflicts (WINE-187 only added files in `components/primitives/` and `hooks/`, and migrated one file `routes/-components/ProductPageSkeleton.tsx` which dev hasn't touched).

- [ ] **Step 3: Sanity test**

```powershell
bun run --filter web test --run
bun run --filter web check-types
```

Expected: web tests pass (190 + skipped), typecheck exit 0.

- [ ] **Step 4: Force-push branch (overwrites the stale remote with the reset)**

```powershell
git push --force-with-lease origin WINE-68-build-wine-catalog-page-with-search-and-filters
```

Use `--force-with-lease` (not `--force`) so the push refuses if someone else pushed in the meantime. Adam has authorized this destructive op via the branch-reset decision.

---

## 2. Scope

**In scope:**

- 7 route bodies replaced with cascade UI composed of domain components.
- New domain components in `components/catalog/`: `WineDetailsCard`, `ProductDetailsCard`, `WinemakerDetailsCard`, `CatalogFilters`, `CatalogResults`, `WineCard` (refactored), `ProductCard`, `WinemakerCard`, `SearchSection`.
- Reuse existing components from `routes/-components/` where their structure is already correct. Migrate them to use primitives instead of inline-class strings.
- Vitest unit tests for every NEW domain component and every refactored component that has logic (filters, search-section composition).
- One commit per task (≥12 commits).

**Out of scope:**

- Owner-side create/edit forms (`/wines/new`, `/wines/$id/edit`, etc.). Deferred to WINE-XXX owner-forms ticket (P8 in plan suite).
- Shop owner inventory management. Deferred to WINE-70.
- Real cart-add UX polish beyond calling `usePostCartsItems`. Deferred to WINE-71.
- Image upload / gallery editing. View-only galleries are in scope; uploads are owner-side, deferred.
- Backend changes. Any `❌ MISSING BE` or `⚠️ verify` from `docs/superpowers/specs/2026-05-08-page-stubs-design.md` §6.3 that turn out to be unimplemented are handed off to BE via a Jira ticket; this plan does NOT add BE code.

---

## 3. Architecture decisions

### 3.1 Route file shape (canonical)

Every catalog route file becomes a thin orchestrator:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { LoadingState } from "@/components/primitives/loading-state";
import { ErrorState } from "@/components/primitives/error-state";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetXxx } from "@/generated/hooks/useGetXxx";
// + 2-5 domain components

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  validateSearch: (s) => ({ ... }),  // keep existing schema
});

function ExplorePage() {
  const search = Route.useSearch();
  const query = useGetXxx(search);

  if (query.isLoading) return <LoadingState variant="catalog" />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;
  if (!query.data?.length) return <EmptyState ... />;

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader title="..." description="..." actions={...} />
      <CatalogFilters ... />          {/* domain */}
      <CatalogResults wines={query.data} /> {/* domain */}
    </div>
  );
}
```

If a route file exceeds ~80 lines of body code, extract more into domain components.

### 3.2 Domain component shape

Domain components in `components/catalog/`:
- Take entity data as props (not query hooks — the route owns data fetching).
- Use the WINE-187 primitives internally (`Section`, `Card variant="..."`, `DescriptionList`, `DataGrid`, etc.).
- Are unit-testable in isolation with mock props.
- Render owner-conditional UI via `<ShowOwner ownerUserId={...}>`.

**Exception:** components that need to fetch additional data (e.g. `WinesAvailableInShops` fetches `useGetProducts?wineId=$wineId`) keep their own query inside. These are clearly "section" components that own a sub-query.

### 3.3 Filter UI: TanStack Router search params, not local state

`<CatalogFilters>` writes via TanStack Router's `useNavigate({ from: Route.fullPath })` + `navigate({ search: { ... }, replace: true })`. Each filter change updates the URL → triggers the route's `useSearch()` → re-fetches data. No local `useState` for filter values.

This means:
- Sharing a filter view is just sharing the URL.
- Back/forward buttons work.
- Tests can drive the filter UI by setting initial route params.

### 3.4 Reuse vs rewrite decision tree

For each existing route-private component in `apps/web/src/routes/-components/`:

```
Does it use lucide-react?     Yes → migrate to hugeicons in this commit (file is being touched anyway)
Does it use hand-rolled skeletons? Yes → swap to <Skeleton> or <LoadingState>
Does it use bg-gray-*/text-white? Yes → swap to semantic tokens
Is its structure already cascade-pattern (named, isolated, prop-driven)?
  Yes → keep, migrate violations only
  No  → rewrite in components/catalog/ with proper structure; delete the route-private version

Is it used by MULTIPLE routes (or will it be)?
  Yes → move to components/catalog/ (cross-route reuse)
  No  → keep in routes/-components/
```

Apply this per file. Note in the commit message what you decided.

### 3.5 Search route (`/search`) composes 5 hooks in parallel

`/search?q=…` aggregates 5 list endpoints. Use a single domain component `<SearchSection>` invoked 5 times (one per entity). Each call passes its own hook + `Link to "..." search={{ q }}`. Limit each section to 3 results client-side via `Array.prototype.slice(0,3)`.

If any list endpoint does NOT support `?q=`, document it under §10 BE backlog and skip that section in this plan. Do NOT block the merge on it.

---

## 4. File structure

### 4.1 New files (domain components in `components/catalog/`)

| Path | Lines | Responsibility | Used by |
|---|---|---|---|
| `apps/web/src/components/catalog/WineCard.tsx` | ~50 | Single wine TYPE card. Image (CatalogPlaceholder fallback), name, color, region, vintage, min-price badge. Click → `/wines/$id`. | `/explore`, `/winemakers/$id`, `/search` |
| `apps/web/src/components/catalog/ProductCard.tsx` | ~55 | Single sellable product card. Image, name, price, bundle badge if `isBundle`, shop link. Click → `/products/$productId`. | `/products`, `/shops/$id`, `/search` |
| `apps/web/src/components/catalog/WinemakerCard.tsx` | ~40 | Winemaker preview card. Initials avatar (CatalogPlaceholder fallback), name, region, wine count, rating. Click → `/winemakers/$id`. | `/winemakers`, `/search` |
| `apps/web/src/components/catalog/CatalogFilters.tsx` | ~120 | Filter sidebar driving TanStack Router search params. q text input, color checkbox, region select, price range slider, rating select. Variants per route via prop `entity: "wines" \| "products" \| "winemakers"`. | `/explore`, `/products`, `/winemakers` |
| `apps/web/src/components/catalog/CatalogResults.tsx` | ~30 | Generic results wrapper. `<DataGrid variant="catalog">` of children + count caption. | `/explore`, `/products`, `/winemakers` |
| `apps/web/src/components/catalog/WineDetailsCard.tsx` | ~60 | Wine TYPE detail body. `<DescriptionList>` of color/region/vintage/alcohol/composition + description + owner Edit menu via `<ShowOwner>`. | `/wines/$id` |
| `apps/web/src/components/catalog/ProductDetailsCard.tsx` | ~80 | Product detail body. Gallery + price/stock + Add-to-cart + bundle contents (if bundle) + owner Edit menu via `<ShowOwner>`. | `/products/$productId` |
| `apps/web/src/components/catalog/WinemakerDetailsCard.tsx` | ~60 | Winemaker profile body. Cover + description + contact (email/phone/website) + owner Edit menu. | `/winemakers/$id` |
| `apps/web/src/components/catalog/SearchSection.tsx` | ~50 | One entity-section for `/search`. Heading + top 3 cards + "View all" link. Generic over the entity type. | `/search` |

### 4.2 New tests (co-located)

One `<name>.test.tsx` for each of the 9 new files above. Tests assert prop-driven rendering and key class strings (responsive grid, owner-gate behavior). Aim ≥3 tests per component, ≥30 total.

### 4.3 Modified route files (replace stub body)

| Path | What to do |
|---|---|
| `apps/web/src/routes/explore.tsx` | Replace `ExploreStub` with `ExplorePage` using `<CatalogFilters entity="wines">` + `<CatalogResults>` of `<WineCard>` |
| `apps/web/src/routes/products.index.tsx` | Same shape, with `<CatalogFilters entity="products">` and `<ProductCard>` |
| `apps/web/src/routes/winemakers.index.tsx` | Same shape, with `<CatalogFilters entity="winemakers">` (only `q` + region) and `<WinemakerCard>` |
| `apps/web/src/routes/wines.$id.tsx` | Replace stub with `<WineDetailsCard wine={...}>` + `<WinesAvailableInShops wineId={id}>` + `<EntityReviewsSection ...>` |
| `apps/web/src/routes/products.$productId.tsx` | Replace stub with `<ProductDetailsCard product={...}>` + `<ProductReviewsSection ...>` + `<ProductRelatedSection ...>` |
| `apps/web/src/routes/winemakers.$id.tsx` | Replace stub with `<WinemakerDetailsCard winemaker={...}>` + their wines (`<WineCard>` grid) + their events (`<EventCard>` grid) + reviews |
| `apps/web/src/routes/search.tsx` | Replace stub with 5 `<SearchSection>` invocations |

### 4.4 Existing route-private files — audit decisions (locked at plan time)

| File | Decision | Reason |
|---|---|---|
| `routes/-components/WineCard.tsx` | DELETE after migration to `components/catalog/WineCard.tsx` | Will be used by 3+ routes; lift to catalog |
| `routes/-components/WineCatalog.tsx` | DELETE; replaced by route-level `<CatalogFilters>` + `<CatalogResults>` | Existing component bundles filter+grid; we split |
| `routes/-components/WineFiltersSidebar.tsx` | DELETE; replaced by `components/catalog/CatalogFilters.tsx` | Same |
| `routes/-components/ProductHero.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductGallery.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductInfo.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductDescriptionCard.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductPriceRow.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductReviewsSection.tsx` | KEEP, migrate violations | reused across `/products/$productId` and `/wines/$id` via `EntityReviewsSection` wrapper |
| `routes/-components/ProductRelatedSection.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductSoldAtCard.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductWinemakerCard.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductWineAssociation.tsx` | KEEP, migrate violations | `/products/$productId` only |
| `routes/-components/ProductImagePlaceholder.tsx` | DELETE; replace with `<CatalogPlaceholder>` from `components/catalog/` | Duplicate |
| `routes/-components/ProductPageSkeleton.tsx` | KEEP (already migrated in WINE-187) | uses `<LoadingState>` |
| `routes/-components/BundleContentsList.tsx` | KEEP, migrate violations | `/products/$productId` (bundle case) |
| `routes/-components/BundleWinesCarousel.tsx` | KEEP, migrate violations | `/products/$productId` (bundle case) |
| `routes/-components/BundlesContainingWine.tsx` | KEEP, migrate violations | `/products/$productId` (non-bundle reverse nav) and `/wines/$id` |
| `routes/-components/WinemakerHero.tsx` | KEEP, migrate violations | `/winemakers/$id` only |
| `routes/-components/WinemakerTabs.tsx` | KEEP, migrate violations | `/winemakers/$id` only |
| `routes/-components/WinemakerWinesList.tsx` | KEEP, migrate violations | `/winemakers/$id` only |
| `routes/-components/WinesAvailableInShops.tsx` | KEEP, migrate violations | `/wines/$id` only |
| `routes/-components/EntityReviewsSection.tsx` | KEEP, migrate violations | `/wines/$id`, `/products/$productId`, `/winemakers/$id` |

"Migrate violations" = swap lucide → hugeicons, hand-rolled skeleton → `<Skeleton>` or `<LoadingState>`, `bg-gray-*` → semantic tokens, inline cascade → primitives where it tightens code. Do NOT rewrite working components.

---

## 5. Tasks

Each task is one commit. The task list groups: bootstrap (Task 1) → new domain components TDD'd (Tasks 2-10) → route migrations (Tasks 11-17) → audit pass on KEEP files (Task 18) → final verification (Task 19).

Working directory: repo root `C:\Users\adamk\Documents\Muni\6.semester\web_project\pb138-project`. PowerShell. For test paths and PowerShell shell escaping, see WINE-187 plan §6 — same patterns apply.

### Task 1: Branch bootstrap (see §1)

Already detailed above. Reset, merge primitives, sanity-test, force-push.

---

### Task 2: Create `<WineCard>` domain component

**Files:**
- Create: `apps/web/src/components/catalog/WineCard.tsx`
- Create: `apps/web/src/components/catalog/WineCard.test.tsx`

**API:**
```tsx
import type { GetWines200Item } from "@/generated/types/GetWines";

interface WineCardProps {
  wine: GetWines200Item;
  minPrice?: number;
}

export function WineCard({ wine, minPrice }: WineCardProps) { ... }
```

**Visual shape (figma `docs/figma/wine-card.png` if exists, else):**
- `<Card variant="catalog">` outer
- `<CardImage>` slot — if `wine.images?.[0]` exists, render `<img>`; else `<CatalogPlaceholder text={wine.color.toUpperCase()} textClassName="text-2xl tracking-widest" />`
- `<CardContent className="p-4 space-y-1">` — `<h3>` name, `<p>` color · region · vintage, `<span>` min price badge if provided
- Click target: wrapper `<Link to="/wines/$id" params={{ id: wine.id }}>`

**TDD steps:**

- [ ] Write `WineCard.test.tsx` with 3 assertions: renders name; renders link to correct URL; renders min-price badge when prop is provided; renders CatalogPlaceholder when no image.
- [ ] Run test — fails (no module).
- [ ] Implement `WineCard.tsx`.
- [ ] Run test — passes.
- [ ] Run `bun run --filter web check-types` — exit 0.
- [ ] Commit: `feat(WINE-68): add WineCard catalog component`.

Refer to WINE-187 Task 1 for exact powershell command shape.

---

### Task 3: Create `<ProductCard>` domain component

**Files:**
- Create: `apps/web/src/components/catalog/ProductCard.tsx`
- Create: `apps/web/src/components/catalog/ProductCard.test.tsx`

**API:**
```tsx
import type { GetProducts200Item } from "@/generated/types/GetProducts";

interface ProductCardProps {
  product: GetProducts200Item;
}
```

**Visual shape:** `<Card variant="catalog">` like `WineCard`, but:
- Badge "BUNDLE" overlay (top-right) when `product.isBundle`
- Price shown directly (no min-price; products have a single price)
- Shop name in metadata row

**TDD steps:** 4 tests: renders name + price; renders link to `/products/$productId`; renders BUNDLE badge when `isBundle=true`; does NOT render BUNDLE badge when `isBundle=false`. Same TDD loop as Task 2. Commit: `feat(WINE-68): add ProductCard catalog component`.

---

### Task 4: Create `<WinemakerCard>` domain component

**Files:**
- Create: `apps/web/src/components/catalog/WinemakerCard.tsx`
- Create: `apps/web/src/components/catalog/WinemakerCard.test.tsx`

**API:**
```tsx
import type { GetWinemakers200Item } from "@/generated/types/GetWinemakers";

interface WinemakerCardProps {
  winemaker: GetWinemakers200Item;
}
```

**Visual shape:** `<Card variant="catalog">` with `<CatalogPlaceholder text={initials} textClassName="text-4xl">` where `initials = winemaker.name.split(" ").map(w => w[0]).slice(0,2).join("")`.

**TDD steps:** 3 tests. Commit: `feat(WINE-68): add WinemakerCard catalog component`.

---

### Task 5: Create `<CatalogFilters>` component

**Files:**
- Create: `apps/web/src/components/catalog/CatalogFilters.tsx`
- Create: `apps/web/src/components/catalog/CatalogFilters.test.tsx`

**API:**
```tsx
interface CatalogFiltersProps {
  entity: "wines" | "products" | "winemakers";
  search: Record<string, unknown>;  // current route search params
  onSearchChange: (next: Record<string, unknown>) => void;
}
```

Routes wire `onSearchChange` to `navigate({ search: next, replace: true })`.

**Sections (conditional on `entity`):**
- All entities: text input bound to `search.q`.
- `entity="wines"`: color checkbox group (red/white/rose), region select.
- `entity="products"`: price range slider (`minPrice`/`maxPrice`), `isBundle` checkbox.
- `entity="winemakers"`: region select only.

Use shadcn `<Input>`, `<Checkbox>`, `<Select>`, `<Slider>` primitives. NEVER hand-roll inputs.

Headings via `<SectionLabel>` from `components/primitives/section-label.tsx`.

**TDD steps:**

- [ ] Write test: rendering each variant produces the expected inputs (text q for all; color checkboxes only when entity=wines; etc.). Use `userEvent.type` to drive q input and assert `onSearchChange` callback fired with `{ q: "..." }`.
- [ ] Run test — fails.
- [ ] Implement.
- [ ] Run — passes (target 5 tests).
- [ ] Typecheck.
- [ ] Commit: `feat(WINE-68): add CatalogFilters domain component`.

---

### Task 6: Create `<CatalogResults>` component

**Files:**
- Create: `apps/web/src/components/catalog/CatalogResults.tsx`
- Create: `apps/web/src/components/catalog/CatalogResults.test.tsx`

**API:**
```tsx
import type { ReactNode } from "react";

interface CatalogResultsProps {
  count?: number;
  children: ReactNode;
}
```

Renders a small "X results" caption + `<DataGrid variant="catalog">` wrapping children. If `count === 0`, defers to caller's `<EmptyState>` (this component does not render empty UI — callers check upstream).

**TDD steps:** 2 tests. Commit: `feat(WINE-68): add CatalogResults wrapper`.

---

### Task 7: Create `<WineDetailsCard>` component

**Files:**
- Create: `apps/web/src/components/catalog/WineDetailsCard.tsx`
- Create: `apps/web/src/components/catalog/WineDetailsCard.test.tsx`

**API:**
```tsx
import type { GetWinesById200 } from "@/generated/types/GetWinesById";

interface WineDetailsCardProps {
  wine: GetWinesById200;
}
```

**Visual shape (figma `docs/figma/wine-detail.png` if present):**
- `<Section heading="About this wine">`
  - `<Card variant="default">`
    - `<CardContent>`
      - `<DescriptionList>`
        - `<PropertyRow label="Color" value={wine.color} />`
        - `<PropertyRow label="Region" value={wine.region} />`
        - `<PropertyRow label="Vintage" value={String(wine.vintageYear)} />`
        - `<PropertyRow label="Alcohol" value={`${wine.alcoholContent}%`} />`
        - `<PropertyRow label="Composition" value={wine.composition} />` (only if non-empty)
      - `<p>{wine.description}</p>` below the list
- `<ShowOwner ownerUserId={wine.winemaker?.userId}>` block containing Edit and Delete buttons that `Link to="/wines/$id/edit"` and `Link to="/wines/$id/images"`. (Delete is a button, not a link — wires to `useDeleteWinesById` when the form ticket lands; for now button is disabled with title "Wired in WINE-XXX owner-forms".)

**TDD steps:** 5 tests. Critical: assert the owner-gated buttons appear when `useUser` is mocked to match `wine.winemaker.userId`, and don't appear otherwise. Use the same `vi.mock("@/context/UserContext", …)` pattern as WINE-187 Task 9. Commit: `feat(WINE-68): add WineDetailsCard component`.

---

### Task 8: Create `<ProductDetailsCard>` component

**Files:**
- Create: `apps/web/src/components/catalog/ProductDetailsCard.tsx`
- Create: `apps/web/src/components/catalog/ProductDetailsCard.test.tsx`

**API:**
```tsx
import type { GetProductsById200 } from "@/generated/types/GetProductsById";

interface ProductDetailsCardProps {
  product: GetProductsById200;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}
```

**Visual shape:**
- `<PageHeader title={product.name} description={shopName} />`
- `<Section heading="Details">`
  - `<Card variant="default">` containing `<DescriptionList>` of price (`<PropertyRow label="Price" value={`€${product.price}`}>`), stock, isBundle status
  - Add-to-cart `<Button onClick={onAddToCart} disabled={isAddingToCart || stock === 0}>`
- `<Section heading="Wines in this product">` — list `product.productWines.map(pw => pw.wine)` using `<WineCard>` mini-variant (or a custom small layout — TBD per figma)
- `<ShowOwner ownerUserId={product.shop?.ownerUserId}>` Edit/Delete

**TDD steps:** 5 tests. Commit: `feat(WINE-68): add ProductDetailsCard component`.

---

### Task 9: Create `<WinemakerDetailsCard>` component

**Files:**
- Create: `apps/web/src/components/catalog/WinemakerDetailsCard.tsx`
- Create: `apps/web/src/components/catalog/WinemakerDetailsCard.test.tsx`

**API:**
```tsx
import type { GetWinemakersById200 } from "@/generated/types/GetWinemakersById";

interface WinemakerDetailsCardProps {
  winemaker: GetWinemakersById200;
}
```

**Visual shape:**
- Header with name + region
- `<Section heading="About">` with `<p>{winemaker.description}</p>`
- `<Section heading="Contact">` with `<DescriptionList>` of email, phone, websiteUrl (only render rows whose values exist)
- `<ShowOwner ownerUserId={winemaker.userId}>` Edit/Images

**TDD steps:** 4 tests. Commit: `feat(WINE-68): add WinemakerDetailsCard component`.

---

### Task 10: Create `<SearchSection>` component

**Files:**
- Create: `apps/web/src/components/catalog/SearchSection.tsx`
- Create: `apps/web/src/components/catalog/SearchSection.test.tsx`

**API (generic):**
```tsx
import type { ReactNode } from "react";

interface SearchSectionProps {
  heading: string;
  count: number;
  viewAllHref: string;
  viewAllSearch?: Record<string, unknown>;
  children: ReactNode;
}
```

Renders `<Section heading>` + child cards inside `<DataGrid variant="catalog">` + a "View all (N)" `<Link>` button at the bottom. If `count === 0`, renders nothing (caller controls).

**TDD steps:** 3 tests. Commit: `feat(WINE-68): add SearchSection wrapper`.

---

### Task 11: Migrate `/explore` route

**Files:**
- Modify: `apps/web/src/routes/explore.tsx`

**Replace the existing stub body** with the canonical orchestrator (§3.1). Use `<CatalogFilters entity="wines">`, `<CatalogResults>` of `<WineCard>` for each item, `<EmptyState>` when no results.

- [ ] **Step 1:** Read `apps/web/src/routes/explore.tsx`. Note the current `validateSearch` schema.
- [ ] **Step 2:** Replace the body. Keep `validateSearch` exactly as-is. New route body uses `useGetWines(search)`.
- [ ] **Step 3:** Run `bun run --filter web check-types`.
- [ ] **Step 4:** Run `bun run --filter web test --run` — existing tests must pass (no route-level test for `/explore` exists; if you find one, update it to mock `useGetWines` properly).
- [ ] **Step 5:** Manual visual check via `bun run --filter web dev` → `http://localhost:5173/explore`. Confirm:
  - Skeleton on load
  - Cards render after data arrives
  - Filter input updates URL search params
  - Empty state when typing a nonsense query
  - Dark mode parity
- [ ] **Step 6:** Commit: `feat(WINE-68): migrate /explore route to cascade pattern`.

---

### Task 12: Migrate `/wines/$id` route

**Files:**
- Modify: `apps/web/src/routes/wines.$id.tsx`

Replace stub with: `<WineDetailsCard wine={wine}>` + `<WinesAvailableInShops wineId={id}>` (existing) + `<EntityReviewsSection entityType="wine" entityId={id}>` (existing).

Same TDD-then-visual loop as Task 11. Commit: `feat(WINE-68): migrate /wines/$id route to cascade pattern`.

---

### Task 13: Migrate `/products` route

**Files:**
- Modify: `apps/web/src/routes/products.index.tsx`

Same canonical orchestrator shape as `/explore`, with `<ProductCard>` instead of `<WineCard>`. Filter: `entity="products"`. Commit: `feat(WINE-68): migrate /products route to cascade pattern`.

---

### Task 14: Migrate `/products/$productId` route

**Files:**
- Modify: `apps/web/src/routes/products.$productId.tsx`

Replace stub with `<ProductDetailsCard product={product} onAddToCart={...} isAddingToCart={...}>` + existing `<ProductReviewsSection>` + existing `<ProductRelatedSection>`. Wire `onAddToCart` to `usePostCartsItems`. Commit: `feat(WINE-68): migrate /products/$productId route to cascade pattern`.

---

### Task 15: Migrate `/winemakers` route

**Files:**
- Modify: `apps/web/src/routes/winemakers.index.tsx`

Same canonical orchestrator. Filter: `entity="winemakers"`. Cards: `<WinemakerCard>`. Commit: `feat(WINE-68): migrate /winemakers route to cascade pattern`.

---

### Task 16: Migrate `/winemakers/$id` route

**Files:**
- Modify: `apps/web/src/routes/winemakers.$id.tsx`

Replace stub with `<WinemakerDetailsCard winemaker={...}>` + `<DataGrid variant="catalog">` of their `<WineCard>`s (from `useGetWines?winemakerId={id}`) + their events list (from `useGetEvents?winemakerId={id}`, rendered with existing `<EventCard>`) + `<EntityReviewsSection entityType="winemaker">`. Commit: `feat(WINE-68): migrate /winemakers/$id route to cascade pattern`.

---

### Task 17: Migrate `/search` route

**Files:**
- Modify: `apps/web/src/routes/search.tsx`

Compose 5 hooks in parallel: `useGetWines({ q })`, `useGetProducts({ q })`, `useGetEvents({ q })`, `useGetWinemakers({ q })`, `useGetShops({ q })`. For each:
- If hook returns data and length > 0: render `<SearchSection heading="Wines" count={data.length} viewAllHref="/explore" viewAllSearch={{ q }}>` with top 3 mapped to `<WineCard>` etc.
- If hook errors: render `<ErrorState message="Wines section failed">` inside that section only.
- If hook returns 0: skip the section entirely.

If any hook does NOT accept `?q=` (per audit): note under §10 BE backlog and SKIP that section in this migration (do not render a broken hook call).

Commit: `feat(WINE-68): migrate /search route to composite cascade`.

---

### Task 18: Audit pass on KEEP files

For each file in §4.4 marked "KEEP, migrate violations":

- [ ] **Step 1:** Read the file.
- [ ] **Step 2:** Apply rules:
  - lucide-react imports → @hugeicons/react + @hugeicons/core-free-icons pattern.
  - `animate-pulse` + `bg-*` → `<Skeleton>`.
  - `bg-gray-*`, `text-white`, `text-black`, `border-gray-*` → semantic tokens.
  - String-concat classes → `cn()`.
  - Inline static `style={{}}` → Tailwind classes.
- [ ] **Step 3:** Run `bun run --filter web test --run` after every 2-3 files (don't wait until the end).
- [ ] **Step 4:** Run `bun run --filter web check-types` after every 2-3 files.
- [ ] **Step 5:** When all KEEP files clean, commit: `refactor(WINE-68): migrate kept route-private components to primitives and tokens`.

If a file is too big to audit safely in one pass (>200 lines), commit per file with `refactor(WINE-68): migrate <ComponentName> to primitives`.

---

### Task 19: Delete obsolete files

After all routes are migrated:

- [ ] `git rm apps/web/src/routes/-components/WineCard.tsx`
- [ ] `git rm apps/web/src/routes/-components/WineCatalog.tsx`
- [ ] `git rm apps/web/src/routes/-components/WineFiltersSidebar.tsx`
- [ ] `git rm apps/web/src/routes/-components/ProductImagePlaceholder.tsx`
- [ ] Run `bun run --filter web check-types` — must pass (callers of these files were updated in Tasks 11-17).
- [ ] Run `bun run --filter web test --run` — must pass.
- [ ] Commit: `chore(WINE-68): remove obsolete route-private catalog components`.

---

### Task 20: Final verification

- [ ] Run `bun run --filter web test --run` — all tests pass.
- [ ] Run `bun run --filter web check-types` — exit 0.
- [ ] Run `bun x biome check src/components/catalog/ src/routes/explore.tsx src/routes/products.* src/routes/wines.\$id.tsx src/routes/winemakers.* src/routes/search.tsx src/routes/-components/` from `apps/web/`. Fix issues. Amend last commit if pure formatting.
- [ ] Manual visual sweep on all 7 routes:
  - `/explore`
  - `/wines/<id>` (use a real id from seed data)
  - `/products`
  - `/products/<id>`
  - `/winemakers`
  - `/winemakers/<id>`
  - `/search?q=ri` (or similar)
  - For each: loading, error, empty-results, success, dark mode.
- [ ] Commit count check: ≥17 commits prefixed `feat(WINE-68):` / `refactor(WINE-68):` / `chore(WINE-68):`.

---

## 6. Per-route layout descriptions (used when figma PNG is missing)

For each route, the spec below is the contract until a figma PNG lands in `docs/figma/<route>.png`. When the PNG appears, follow the figma over this description for visual details (spacing, colors). The data flow and prop API are fixed regardless.

### 6.1 `/explore`

- Top: `<PageHeader title="Explore wines" description="Discover wines from independent winemakers." />`
- Two-column layout from `lg:` up: left `<CatalogFilters entity="wines">` (300px), right results (1fr).
- Mobile: filters collapse into a `<Sheet>` triggered by a filter button.
- Results: `<CatalogResults count={data.length}>` containing a `<DataGrid variant="catalog">` of `<WineCard>` per item.

### 6.2 `/wines/$id`

- Top: back link "← Explore wines" via `<Link to="/explore">`.
- Hero: wine image (first from `useGetWinesByIdImages`) or `<CatalogPlaceholder text={color}>` on the left, title + winemaker link + region/vintage badge on the right.
- Below hero: `<WineDetailsCard wine={wine}>`.
- `<Section heading="Where to buy">` containing `<WinesAvailableInShops wineId={id}>` (existing component, lists products selling this wine).
- `<Section heading="Reviews">` containing `<EntityReviewsSection entityType="wine" entityId={id}>` (existing).

### 6.3 `/products`

- Same layout as `/explore` but cards are `<ProductCard>`, filter is `entity="products"`. Filter exposes `q`, price range, `isBundle` checkbox.

### 6.4 `/products/$productId`

- Back link "← Products".
- `<ProductDetailsCard product={...} onAddToCart={...}>` is the main column.
- Right column (lg+): `<ProductSoldAtCard shop={product.shop}>` (existing).
- Below: if `product.isBundle`, `<BundleContentsList wines={product.productWines}>`. Else `<BundlesContainingWine productId={id}>` (existing reverse-bundle nav).
- `<ProductReviewsSection productId={id}>` (existing).
- `<ProductRelatedSection productId={id}>` (existing).

### 6.5 `/winemakers`

- Same layout as `/explore`. Filter: `q` + region.

### 6.6 `/winemakers/$id`

- Hero: `<WinemakerHero winemaker={winemaker}>` (existing — audit for violations).
- `<WinemakerDetailsCard winemaker={winemaker}>` (about + contact + owner Edit gate).
- `<Section heading="Wines">` containing a `<DataGrid variant="catalog">` of `<WineCard>` for each wine from `useGetWines?winemakerId={id}`.
- `<Section heading="Events">` containing `<EventCard>` per event from `useGetEvents?winemakerId={id}` (or `<EmptyState>` if none).
- `<Section heading="Reviews">` with `<EntityReviewsSection entityType="winemaker" entityId={id}>`.

### 6.7 `/search`

- `<PageHeader title="Search results" description={`Showing results for "${q}"`} />`
- Five sections in document order: Wines, Products, Events, Winemakers, Shops. Each via `<SearchSection>`.
- "View all (N)" links use the entity's canonical list URL with `?q={q}` carried over.

---

## 7. Verification gates

| Gate | Command (from repo root) | Pass criterion |
|---|---|---|
| Web tests | `bun run --filter web test --run` | All pass |
| Web typecheck | `bun run --filter web check-types` | Exit 0 |
| Biome | `cd apps/web && bun x biome check src/components/catalog/ src/routes/-components/` | Exit 0 |
| Manual dark-mode sweep | 7 routes loaded in dev with theme toggle | Adam confirms parity |

**Not run, intentionally:**
- `bun run validate` — fails on dev (vitest 4 + zod 4 Windows-only) until BE ticket lands
- `bun run build` — same
- Server tests — unrelated

---

## 8. Risks and open decisions

- **Existing route-private components may have undiscovered violations** (legacy `bg-gray-*`, lucide imports, hand-rolled skeletons). Task 18 catches them, but Adam should sanity-check the audit pass commit before merging.
- **The `?q=` and `?winemakerId=`, `?isBundle=` filters on Orval list hooks are not all confirmed wired on BE.** Plan assumes they exist per spec §6.3. If a filter param is silently ignored by the API, the FE will still render but the filter won't actually narrow results. Acceptable for milestone visibility — flag missing filters in `docs/UI_AUDIT.md`.
- **Cart-add UX is minimal.** No optimistic update, no toast, no quantity picker on the product detail page. Add-to-cart is a single button. Polishing is deferred to WINE-71 cart cluster.
- **Search-page composition is unoptimized.** 5 parallel queries on every keystroke (debounced ~300ms via `use-debounce` from `@/hooks`). If the page feels janky, debounce duration is the first knob.
- **Owner-gating depends on hooks returning `winemaker.userId` / `shop.ownerUserId`.** If those fields aren't on the response shape (BE gap), `<ShowOwner>` will silently render nothing. Add a runtime warning console.warn in `WineDetailsCard` / `ProductDetailsCard` / `WinemakerDetailsCard` when these fields are missing.

---

## 9. Success criteria

The plan is complete when:

1. The 9 new domain components in `components/catalog/` exist and are tested.
2. The 7 route files use the canonical orchestrator shape from §3.1.
3. All 4 obsolete files in §4.4 are deleted.
4. All KEEP files in §4.4 pass the audit (no lucide, no hand-rolled skeletons, no hardcoded colors, no inline static styles, no string-concat classes).
5. `bun run --filter web test --run` passes.
6. `bun run --filter web check-types` exits 0.
7. Adam visually confirms all 7 routes in light + dark mode.
8. The branch has ≥17 commits prefixed `feat(WINE-68):` / `refactor(WINE-68):` / `chore(WINE-68):`.

---

## 10. BE backlog handed off from this ticket

Capture any FE-visible gaps in this section. Add a row per gap. Adam ships these to BE via Jira.

- (To be populated during execution as Gemini discovers gaps.)

Examples that may appear:
- `useGetProducts?wineId=` not wired — `/wines/$id` "where to buy" section can't filter
- `useGetWines?winemakerId=me` not respected — winemaker self-view broken
- `useGetEvents?winemakerId=` not respected — `/winemakers/$id` events tab broken
- list endpoints don't accept `?q=` — `/search` and filter inputs effectively no-op
