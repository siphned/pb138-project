# Frontend Route & Component Colocation Refactor — Design

**Date:** 2026-06-14
**Branch:** `WINE-260-frontend-refactoring-from-3-milestone` (single PR)
**Scope:** `apps/web/src/` only

## Goal

Restructure the web app so that:

1. **Routes** use directory nesting instead of dot-separated flat filenames
   (`shops.$id.edit.tsx` → `shops/$id/edit.tsx`).
2. **Custom components** are colocated as deep in the route tree as possible —
   each lands in the `-components/` folder of the deepest route directory that is
   a common ancestor of every route transitively using it.
3. **Shared infrastructure stays put**: `components/ui/` (shadcn),
   `components/primitives/`, `components/layout/` remain in `components/`.
   Everything else under `components/` moves into the routes tree.
4. **Unit tests** travel with the component they cover (colocated in the routes tree).

The whole change must pass `bun run validate`
(`lint → check → generate → check-types → test → test:e2e → build`).

## Non-goals

- No change to routing behavior, URLs, or rendered output.
- No refactoring of component internals, logic, or styling.
- No changes outside `apps/web/src/` (except the generated `routeTree.gen.ts`).
- `components/ui/`, `components/primitives/`, `components/layout/` are untouched.

## Key technical facts

- TanStack Router's Vite plugin treats `.` and `/` as **identical** path
  separators. Renaming flat files to nested directories produces an identical
  route tree. `routeTree.gen.ts` regenerates with no semantic diff.
- The default `routeFileIgnorePrefix` is `-`, so `-components/` folders are
  excluded from route generation at any depth.
- Most source imports use the `@/` path alias, so file depth changes do not break
  alias imports. Only **relative** imports (e.g. `./-components/Foo`) and imports
  that point at a moved file need rewriting.

---

## Phase A — Route file conversion (dot → directory)

Pure rename. Rule: replace every dot-separator between path segments with a slash;
keep the final `.tsx`. A route file that also acts as a layout (e.g. `wines.$id.tsx`)
stays a file at its level; its children move into a sibling folder of the same name.

Examples:

```
shops.$id.index.tsx                      → shops/$id/index.tsx
shops.$id.edit.tsx                       → shops/$id/edit.tsx
shops.$id.inventory.$productId.edit.tsx  → shops/$id/inventory/$productId/edit.tsx
shops.$id.bundles.new.tsx                → shops/$id/bundles/new.tsx
events.$id.invitations.tsx               → events/$id/invitations.tsx
wines.$id.tsx                            → wines/$id.tsx          (layout, stays a file)
wines.$id.edit.tsx                       → wines/$id/edit.tsx
winemakers.$id.index.tsx                 → winemakers/$id/index.tsx
checkout.confirmed.tsx                   → checkout/confirmed.tsx
_authenticated.tsx                       → _authenticated.tsx     (unchanged)
_authenticated.orders.$id.tsx            → _authenticated/orders/$id.tsx
_authenticated._admin.users.$id.tsx      → _authenticated/_admin/users/$id.tsx
_authenticated._shop_owner.manage.shops.$id.tsx
                                         → _authenticated/_shop_owner/manage/shops/$id.tsx
```

Steps:

1. `git mv` each flat route file to its nested path (preserves history).
2. Rewrite any **relative** imports inside moved files whose target did not move
   with them. (`@/`-aliased imports need no change.)
3. Regenerate the route tree and run `bun run check-types` + `bun run test`.
   The route tree diff must be semantically empty (only ordering/formatting).

**Gate for Phase A:** `check-types` and `test` green; route tree unchanged in meaning.

---

## Phase B — Component colocation

### Population

In scope (moves into routes tree):

- All files in `routes/-components/` (flat — gets redistributed deeper).
- All files in `components/`: `catalog/`, `shops/`, `events/`, `dashboard/`,
  `forms/`, `home/`, `reviews/`, `settings/`, `stats/`, `dev/`
  (including their `.test.tsx` and helper files like `types.ts`, `__tests__/`).

Out of scope (stay in `components/`):

- `components/ui/` (shadcn), `components/primitives/`, `components/layout/`.

### Placement algorithm

1. Build the import graph for `apps/web/src` with **ts-morph**.
2. For each in-scope component, compute the set of **route files** (post-Phase-A
   paths) that transitively import it.
3. Target directory = deepest common-ancestor directory of that route set.
   - All usages under one subtree → `<subtree>/-components/`.
   - Usages span multiple top-level route groups → `routes/-components/` (root).
4. Move the component (and its `.test.tsx` and any private helper it owns) to
   `<target>/-components/Name.tsx`.
5. A component imported only by other in-scope components (not directly by a route)
   inherits the route set of its importers, computed transitively in the same pass.

Expected outcomes (illustrative):

```
ShopEditForm (only shops/$id/*)        → routes/shops/$id/-components/ShopEditForm.tsx
InventoryEditForm (shops/$id/inventory)→ routes/shops/$id/inventory/-components/InventoryEditForm.tsx
ProductHero / ProductGallery (products/$productId)
                                       → routes/products/$productId/-components/...
catalog/CatalogCard (cross-cutting)    → routes/-components/CatalogCard.tsx
forms/TextField, EntityImage, StarRating (cross-cutting)
                                       → routes/-components/...
```

### Import rewriting

A single ts-morph codemod pass:

- Moves each file to its computed target.
- Rewrites every import specifier that referenced a moved file to its new
  `@/...` path (prefer the `@/` alias for the new location so future depth
  changes stay cheap).
- Re-points intra-component imports among moved files.

### Gate for Phase B

`bun run check` (biome write/organize-imports), `bun run check-types`, and
`bun run test` all green. tsc is the backstop for any missed import rewrite.

---

## Execution & safety

- **One PR**, on the existing branch, Phase A committed before Phase B.
- Moves use `git mv` / ts-morph file moves to preserve history where practical.
- The mechanism is a **ts-morph codemod**, not manual editing, because ~200 files
  and their imports are affected.
- Final acceptance: `bun run validate` passes end to end.

## Risks

| Risk | Mitigation |
|---|---|
| Missed import after move | `tsc --noEmit` fails the gate; fix before commit. |
| Route tree semantic change | Diff `routeTree.gen.ts` after Phase A; must be meaning-preserving. |
| Relative imports inside route files break on depth change | Codemod rewrites relative imports; prefer `@/` alias. |
| A "shared" component pushed too deep | Algorithm uses the deepest **common** ancestor of *all* transitive route importers — cross-cutting components stay at `routes/-components/`. |
| E2E breakage | Routing behavior unchanged; URLs identical, so Playwright specs are unaffected. |
| Biome `useImportType` / organize-imports noise | `bun run check` runs in the gate and auto-fixes. |
