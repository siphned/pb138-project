# WINE-187 — Foundation Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared primitive layer (`PageHeader`, `Section`, `LoadingState`, `ErrorState`, `EmptyState`, `DescriptionList`/`PropertyRow`, `DataGrid`, `useIsOwner`/`ShowOwner`) that every subsequent FE ticket (WINE-173 … WINE-180) composes inside its domain components.

**Architecture:** Cascade pattern — routes import 2-5 domain components from `components/{feature}/`; each domain component composes the primitives in this plan in a `Page → Section → Card → atoms` hierarchy. Primitives are pure, theme-token-only, dark-mode-correct, and have no business logic. They wrap shadcn `<Card>`, `<Skeleton>`, `<Button>` instead of reinventing them. State containers (`LoadingState` / `ErrorState` / `EmptyState`) and the ownership gate (`useIsOwner` / `<ShowOwner>`) replace ~10 inline-skeleton + ad-hoc-error-UI strings scattered across existing routes.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui, Base UI (`@base-ui/react`), CVA, `hugeicons-react`, Vitest 4 + happy-dom + `@testing-library/react`, TanStack Router, Clerk via `useUser()`.

---

## Hard rules for the implementing agent

You MUST follow every rule below. They override generic React habits.

1. **No new `lucide-react` imports.** Icons in NEW files come from `@hugeicons/react` only (rule A6 in `CLAUDE.local.md` is slightly stale — the actual installed package is `@hugeicons/react`, not `hugeicons-react`). Usage pattern: import the icon DATA from `@hugeicons/core-free-icons` and render via the `<HugeiconsIcon icon={...} />` component from `@hugeicons/react`. See `apps/web/src/components/ui/accordion.tsx` for the canonical pattern. Existing files keep their lucide imports — do not touch them in this plan.
2. **No hardcoded colors.** Only semantic tokens: `bg-background`, `bg-card`, `bg-muted`, `bg-primary`, `bg-destructive`, `text-foreground`, `text-muted-foreground`, `border-border`, etc. Forbidden: `bg-gray-*`, `text-black`, `text-white`, `#hex`, `rgb(…)`. (Rule B2.)
3. **No hand-rolled skeletons.** Use `<Skeleton>` from `@/components/ui/skeleton`. Forbidden combo: `animate-pulse` + a `bg-*` div. (Rule B1.)
4. **No inline `style={{}}` for static values.** Tailwind class via `cn()`. Inline style only when value is dynamic AND no Tailwind utility fits (e.g. `width: ${percent}%` for a progress bar). (Rule B5.)
5. **Use `cn()` from `@/lib/utils` for all class composition.** Never `+` or template literals on `className`. (Rule B4.)
6. **`components/primitives/` is where these files live.** Not `components/ui/`. (Rule A2.) `ui/` is reserved for shadcn primitives only.
7. **Every primitive must be dark-mode-correct.** If a semantic token doesn't fit, use explicit `dark:` variants. (Rule B3.)
8. **No new state libraries, no new utility libs.** Use `cn()`, `class-variance-authority`, `@base-ui/react`, `hugeicons-react`, shadcn primitives — all already installed.
9. **Don't add comments that describe what the code does.** Only add a one-line comment when the WHY is non-obvious. Read `CLAUDE.md` § "Tone and style" before writing comments.
10. **Conventional commits.** Format: `feat(WINE-187): <short imperative>` / `test(WINE-187): …` / `refactor(WINE-187): …`. No PR-flavor wording in the commit body.

If you're unsure whether a rule applies, STOP and ask the human reviewer before writing code.

---

## 1. Context

### 1.1 Why this is P0

`apps/web` has page stubs (`<StubGet>`, `<StubMutation>`) on every route after WINE-171. The next round of tickets (WINE-173 catalog cluster, WINE-174 shops, WINE-175 events, …) replaces each stub with real UI. Every ticket downstream will need:

- A page-header pattern (title + optional description + optional right-side action slot).
- A section pattern (heading + body, consistent vertical spacing).
- Skeletons for "loading" and an error retry block for "failed" — currently each route invents its own (`apps/web/src/routes/wines.$id.tsx:22-32`, `apps/web/src/routes/products.$productId.tsx` etc.).
- An "empty result" block for `/explore` filter results, `/orders` list, etc.
- A label/value pair for detail-page facts (wine attributes, shop info, order summary).
- A responsive grid for catalog cards.
- A way to render Edit/Delete buttons only when the current user owns the resource being viewed.

Building these on a per-ticket basis guarantees drift. P0 ships them once.

### 1.2 What already exists (do not re-implement)

| Primitive | Location | Notes |
|---|---|---|
| `<Card>` with `variant: default \| catalog \| section` | `apps/web/src/components/ui/card.tsx` | shadcn primitive extended in WINE-169 |
| `<NavItem>` | `apps/web/src/components/primitives/nav-item.tsx` | Base UI `useRender` + CVA. Used by `Sidebar.tsx`. |
| `<SectionLabel>` | `apps/web/src/components/primitives/section-label.tsx` | Small uppercase tracking-widest heading. Used in `FilterSidebar`. |
| `<CatalogPlaceholder>` | `apps/web/src/components/catalog/CatalogPlaceholder.tsx` | Gradient image-slot fallback for catalog cards. |
| `<Skeleton>` | `apps/web/src/components/ui/skeleton.tsx` | shadcn. `animate-pulse rounded-xl bg-muted`. |
| `<Button>`, `<Badge>`, `<Avatar>`, etc. | `apps/web/src/components/ui/*` | All shadcn. Use them. |
| `useUser()` returning `{ user, activeRole, isLoading, ... }` | `apps/web/src/context/UserContext.tsx` | Reads `users/me` via Clerk. |

### 1.3 Cascade pattern reference

A route in the real-UI era looks like this:

```tsx
// apps/web/src/routes/wines.$id.tsx (TARGET shape; you do NOT migrate this route in P0)
function WineDetailPage() {
  const { id } = Route.useParams();
  const query = useGetWinesById(id);
  if (query.isLoading) return <LoadingState variant="detail" />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;
  const wine = query.data;

  return (
    <PageLayout>
      <PageHeader title={wine.name} description={`${wine.color} · ${wine.region}`} />
      <WineDetails wine={wine} />              {/* domain component */}
      <WinesAvailableInShops wineId={id} />   {/* domain component, already exists */}
      <EntityReviewsSection ... />            {/* domain component, already exists */}
    </PageLayout>
  );
}

// apps/web/src/components/catalog/WineDetails.tsx — domain component using primitives
function WineDetails({ wine }) {
  return (
    <Section heading="About this wine">
      <Card variant="default">
        <CardContent>
          <DescriptionList>
            <PropertyRow label="Region" value={wine.region} />
            <PropertyRow label="Vintage" value={String(wine.vintageYear)} />
            <PropertyRow label="Alcohol" value={`${wine.alcoholContent}%`} />
          </DescriptionList>
        </CardContent>
      </Card>
    </Section>
  );
}
```

Your job in P0 is to build the primitives in the snippet (`PageLayout`, `PageHeader`, `LoadingState`, `ErrorState`, `Section`, `DescriptionList`, `PropertyRow`). You do NOT migrate `wines.$id.tsx` in this plan — that lands in WINE-173.

---

## 2. Scope

**In scope:**

- 8 new primitive components + 1 new hook in `apps/web/src/components/primitives/` and `apps/web/src/hooks/`.
- 1 reference migration: `apps/web/src/routes/-components/ProductPageSkeleton.tsx` is replaced by `LoadingState` to prove the primitive works. This is the only existing file modified in P0.
- Vitest unit tests for every primitive that has logic (state containers, hook, ownership gate). Pure-style primitives (`Section`, `DescriptionList`, `PageHeader`) get one smoke test each.
- One commit per task (≥10 commits total).

**Out of scope:**

- Migration of any other existing route or route-private component. Each cluster ticket (WINE-173+) migrates its own routes.
- Form primitives (`<FormSection>`, `<FormActions>`, `<FormError>`). Deferred to WINE-180 (Owner forms ticket) so they're designed against the actual form requirements.
- Toast / notification system. Not blocking any ticket.
- Replacing existing `<NavItem>` / `<SectionLabel>` / `<CatalogPlaceholder>` — they stay.
- Changes to `Sidebar`, `Header`, `PublicLayout`, `AuthLayout`. They stay.
- Hugeicons migration of OLD files. Only NEW files in P0 must use hugeicons.

---

## 3. Architecture decisions

### 3.1 Two folders, two roles

- `apps/web/src/components/primitives/` — UI primitives without business logic. Take props, return JSX. New files: `page-header.tsx`, `section.tsx`, `loading-state.tsx`, `error-state.tsx`, `empty-state.tsx`, `description-list.tsx`, `data-grid.tsx`, `show-owner.tsx`.
- `apps/web/src/hooks/` — reusable hooks. New file: `useIsOwner.ts`.

`<ShowOwner>` lives in `primitives/` because it's a render gate; the hook lives separately so a component can read the boolean directly when it needs branching beyond `children ?? null`.

### 3.2 CVA for variants only when ≥2 variants exist

- `LoadingState` has variants (`detail`, `list`, `catalog`, `form`) → CVA.
- `DataGrid` has variants (`catalog`, `gallery`, `list`) → CVA.
- `Section`, `PageHeader`, `DescriptionList`, `PropertyRow`, `ErrorState`, `EmptyState` have ONE style → plain props, no CVA. Add CVA later if a second variant appears.

This matches `<SectionLabel>` (no CVA) vs `<NavItem>` (CVA with 3 variants) precedent already in the codebase.

### 3.3 Base UI `useRender` only where polymorphism is real

- `<Section>` defaults to `<section>` but consumers MAY want `<article>` on detail pages → `useRender`.
- `<PageHeader>` is always a `<header>` block → plain `<header>`. No `useRender`.
- State containers (`LoadingState`/`ErrorState`/`EmptyState`) are always `<div>` → no `useRender`.

Use `useRender` only when at least one realistic consumer wants a different default tag. Don't add it preemptively.

### 3.4 Hugeicons for new code

All icons in P0 come from `@hugeicons/react` + `@hugeicons/core-free-icons`. Icon picks per primitive:

| Primitive | Icon data import | Renderer usage |
|---|---|---|
| `ErrorState` | `AlertCircleIcon` from `@hugeicons/core-free-icons` | `<HugeiconsIcon icon={AlertCircleIcon} className="h-10 w-10 text-destructive" />` |
| `EmptyState` | `InboxIcon` from `@hugeicons/core-free-icons` | `<HugeiconsIcon icon={InboxIcon} className="h-10 w-10 text-muted-foreground" />` |
| `LoadingState` | none (uses `<Skeleton>`) | — |

Existing OLD files still use lucide. Do not touch them.

### 3.5 Tests use `vitest` + `@testing-library/react`

Test setup is already wired in `apps/web/src/__tests__/setup.ts` (just `import "@testing-library/jest-dom";`). The Vitest config (`apps/web/vitest.config.ts`) uses `environment: "happy-dom"` and includes `src/**/*.test.{ts,tsx}` — meaning **test files co-located next to their primitive are auto-picked up**. We use this co-location.

Pattern: `apps/web/src/components/primitives/loading-state.tsx` ↔ `apps/web/src/components/primitives/loading-state.test.tsx`.

### 3.6 `useIsOwner` decision

Two design choices for ownership gate:

- **Option A — Hook + thin component wrapper.** `useIsOwner({ ownerUserId })` returns `boolean`; `<ShowOwner ownerUserId={…}>{...}</ShowOwner>` is `useIsOwner({ ownerUserId }) ? children : null`. CHOSEN.
- Option B — Component-only. Loses the ability to use the boolean in conditional rendering (e.g. `<Menu items={isOwner ? ownerItems : guestItems}>`). REJECTED.

Ownership input is the resource's `ownerUserId` (the user-id, not a role string). `useIsOwner` reads `useUser()` and returns `user?.id === ownerUserId`. It does NOT check active role — a user with shop_owner role who doesn't own THIS shop shouldn't see Edit. Role-only gates already work via Clerk's `<Show>` + `currentActiveRole`; this hook covers the orthogonal "is this MY resource?" check.

---

## 4. File structure

### 4.1 New files

| Path | Lines (approx) | Responsibility |
|---|---|---|
| `apps/web/src/components/primitives/page-header.tsx` | ~25 | `<header>` block: title + optional description + optional right-side action slot |
| `apps/web/src/components/primitives/section.tsx` | ~25 | `<section>` block: `<SectionLabel>` heading + body, consistent vertical spacing |
| `apps/web/src/components/primitives/loading-state.tsx` | ~55 | Skeleton layout with `variant: detail \| list \| catalog \| form` |
| `apps/web/src/components/primitives/error-state.tsx` | ~30 | Icon + message + optional Retry button |
| `apps/web/src/components/primitives/empty-state.tsx` | ~30 | Icon + message + optional CTA button |
| `apps/web/src/components/primitives/description-list.tsx` | ~30 | `<DescriptionList>` + `<PropertyRow>` pair for label/value detail blocks |
| `apps/web/src/components/primitives/data-grid.tsx` | ~30 | Responsive CSS-grid wrapper with `variant: catalog \| gallery \| list` |
| `apps/web/src/components/primitives/show-owner.tsx` | ~15 | `<ShowOwner ownerUserId={...}>` render gate |
| `apps/web/src/hooks/useIsOwner.ts` | ~10 | Hook returning `boolean` |
| `apps/web/src/components/primitives/page-header.test.tsx` | ~20 | Smoke test |
| `apps/web/src/components/primitives/section.test.tsx` | ~20 | Smoke test |
| `apps/web/src/components/primitives/loading-state.test.tsx` | ~35 | Per-variant render checks |
| `apps/web/src/components/primitives/error-state.test.tsx` | ~30 | Renders message + Retry fires `onRetry` |
| `apps/web/src/components/primitives/empty-state.test.tsx` | ~30 | Renders message + CTA fires |
| `apps/web/src/components/primitives/description-list.test.tsx` | ~20 | Renders rows |
| `apps/web/src/components/primitives/data-grid.test.tsx` | ~20 | Each variant emits the expected grid classes |
| `apps/web/src/components/primitives/show-owner.test.tsx` | ~35 | Renders children only when ownerUserId matches user.id |
| `apps/web/src/hooks/useIsOwner.test.ts` | ~30 | Returns true/false correctly |

### 4.2 Modified files

| Path | Change | Notes |
|---|---|---|
| `apps/web/src/routes/-components/ProductPageSkeleton.tsx` | Replace body with `<LoadingState variant="detail" />` | Proves the primitive on a real consumer. Only 1 existing file modified in P0. |

### 4.3 Files NOT touched

`Sidebar`, `Header`, `PublicLayout`, `AuthLayout`, all existing routes, all existing route-private components other than `ProductPageSkeleton`, all of `components/{ui,catalog,dashboard,reviews,dev}/`, all of `components/primitives/{nav-item,section-label}.tsx`.

---

## 5. Primitive APIs

### 5.1 `<PageHeader>`

`apps/web/src/components/primitives/page-header.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
    </header>
  );
}
```

**Usage:**
```tsx
<PageHeader
  title="Explore wines"
  description="Discover wines from independent winemakers."
  actions={<Button>+ Add wine</Button>}
/>
```

### 5.2 `<Section>`

`apps/web/src/components/primitives/section.tsx`:

```tsx
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { SectionLabel } from "@/components/primitives/section-label";
import { cn } from "@/lib/utils";

interface SectionProps extends useRender.ComponentProps<"section"> {
  heading?: string;
  children: ReactNode;
}

export function Section({ heading, className, children, render, ...props }: SectionProps) {
  return useRender({
    defaultTagName: "section",
    props: mergeProps<"section">(
      { className: cn("space-y-4", className) },
      { children: (
        <>
          {heading && <SectionLabel>{heading}</SectionLabel>}
          {children}
        </>
      ) },
      props,
    ),
    render,
    state: { slot: "section" },
  });
}
```

**Usage:**
```tsx
<Section heading="About this wine">
  <Card variant="default">…</Card>
</Section>

<Section heading="Reviews" render={<article />}>…</Section>
```

### 5.3 `<LoadingState>`

`apps/web/src/components/primitives/loading-state.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const loadingStateVariants = cva("animate-in fade-in duration-200", {
  variants: {
    variant: {
      detail: "space-y-6",
      list: "space-y-3",
      catalog: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
      form: "space-y-4",
    },
  },
  defaultVariants: { variant: "detail" },
});

type LoadingStateProps = React.ComponentProps<"div"> & VariantProps<typeof loadingStateVariants>;

export function LoadingState({ className, variant = "detail", ...props }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(loadingStateVariants({ variant }), className)}
      data-slot="loading-state"
      {...props}
    >
      {variant === "detail" && (
        <>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </>
      )}
      {variant === "list" && (
        <>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </>
      )}
      {variant === "catalog" && (
        <>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full hidden lg:block" />
          <Skeleton className="aspect-[4/5] w-full hidden lg:block" />
          <Skeleton className="aspect-[4/5] w-full hidden lg:block" />
        </>
      )}
      {variant === "form" && (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </>
      )}
    </div>
  );
}

export { loadingStateVariants };
```

### 5.4 `<ErrorState>`

`apps/web/src/components/primitives/error-state.tsx`:

```tsx
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center",
        className,
      )}
      data-slot="error-state"
      role="alert"
    >
      <HugeiconsIcon aria-hidden className="h-10 w-10 text-destructive" icon={AlertCircleIcon} />
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}
```

### 5.5 `<EmptyState>`

`apps/web/src/components/primitives/empty-state.tsx`:

```tsx
import { InboxIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  message = "There's nothing to show.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center",
        className,
      )}
      data-slot="empty-state"
    >
      <HugeiconsIcon aria-hidden className="h-10 w-10 text-muted-foreground" icon={InboxIcon} />
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
```

### 5.6 `<DescriptionList>` + `<PropertyRow>`

`apps/web/src/components/primitives/description-list.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DescriptionListProps {
  children: ReactNode;
  className?: string;
}

export function DescriptionList({ children, className }: DescriptionListProps) {
  return (
    <dl className={cn("grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm", className)}>
      {children}
    </dl>
  );
}

interface PropertyRowProps {
  label: string;
  value: ReactNode;
}

export function PropertyRow({ label, value }: PropertyRowProps) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </>
  );
}
```

**Usage:**
```tsx
<DescriptionList>
  <PropertyRow label="Region" value="Tokaj" />
  <PropertyRow label="Vintage" value="2021" />
  <PropertyRow label="Alcohol" value="12.5%" />
</DescriptionList>
```

### 5.7 `<DataGrid>`

`apps/web/src/components/primitives/data-grid.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const dataGridVariants = cva("grid gap-6", {
  variants: {
    variant: {
      catalog: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      gallery: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      list: "grid-cols-1",
    },
  },
  defaultVariants: { variant: "catalog" },
});

interface DataGridProps extends VariantProps<typeof dataGridVariants> {
  children: ReactNode;
  className?: string;
}

export function DataGrid({ variant, children, className }: DataGridProps) {
  return <div className={cn(dataGridVariants({ variant }), className)}>{children}</div>;
}

export { dataGridVariants };
```

### 5.8 `useIsOwner` hook

`apps/web/src/hooks/useIsOwner.ts`:

```ts
import { useUser } from "@/context/UserContext";

interface UseIsOwnerArgs {
  ownerUserId: string | null | undefined;
}

export function useIsOwner({ ownerUserId }: UseIsOwnerArgs): boolean {
  const { user } = useUser();
  if (!user || !ownerUserId) return false;
  return user.id === ownerUserId;
}
```

### 5.9 `<ShowOwner>` render gate

`apps/web/src/components/primitives/show-owner.tsx`:

```tsx
import type { ReactNode } from "react";
import { useIsOwner } from "@/hooks/useIsOwner";

interface ShowOwnerProps {
  ownerUserId: string | null | undefined;
  fallback?: ReactNode;
  children: ReactNode;
}

export function ShowOwner({ ownerUserId, fallback = null, children }: ShowOwnerProps) {
  const isOwner = useIsOwner({ ownerUserId });
  return <>{isOwner ? children : fallback}</>;
}
```

**Usage:**
```tsx
<ShowOwner ownerUserId={wine.winemaker.userId}>
  <Button>Edit</Button>
  <Button variant="destructive">Delete</Button>
</ShowOwner>
```

---

## 6. Tasks

Each task is one commit. Run order is fixed because some tests import earlier primitives.

Working directory for **all** commands below is the repo root:
`C:\Users\adamk\Documents\Muni\6.semester\web_project\pb138-project`

Use PowerShell. For `cd`-ing into `apps/web` use double quotes around the path.

### Task 1: Create `<PageHeader>`

**Files:**
- Create: `apps/web/src/components/primitives/page-header.tsx`
- Create: `apps/web/src/components/primitives/page-header.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/page-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Explore wines" />);
    expect(screen.getByRole("heading", { level: 1, name: "Explore wines" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<PageHeader title="t" description="some description" />);
    expect(screen.getByText("some description")).toBeInTheDocument();
  });

  it("renders the actions slot", () => {
    render(<PageHeader title="t" actions={<button type="button">Click</button>} />);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/page-header.test.tsx
```

Expected: FAIL with `Cannot find module './page-header'` (or similar).

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/page-header.tsx` with the body from §5.1.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/page-header.test.tsx
```

Expected: PASS, 3 tests passing.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/page-header.tsx apps/web/src/components/primitives/page-header.test.tsx
git commit -m "feat(WINE-187): add PageHeader primitive"
```

---

### Task 2: Create `<Section>`

**Files:**
- Create: `apps/web/src/components/primitives/section.tsx`
- Create: `apps/web/src/components/primitives/section.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./section";

describe("Section", () => {
  it("renders heading and children", () => {
    render(
      <Section heading="Reviews">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders without a heading", () => {
    render(
      <Section>
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("supports render prop polymorphism", () => {
    const { container } = render(
      <Section render={<article data-testid="art" />}>
        <p>body</p>
      </Section>,
    );
    expect(container.querySelector("article")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/section.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/section.tsx` with the body from §5.2.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/section.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/section.tsx apps/web/src/components/primitives/section.test.tsx
git commit -m "feat(WINE-187): add Section primitive"
```

---

### Task 3: Create `<LoadingState>`

**Files:**
- Create: `apps/web/src/components/primitives/loading-state.tsx`
- Create: `apps/web/src/components/primitives/loading-state.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/loading-state.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

describe("LoadingState", () => {
  it("renders detail variant by default and sets aria-busy", () => {
    const { container } = render(<LoadingState />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("aria-busy")).toBe("true");
    expect(wrapper?.className).toMatch(/space-y-6/);
  });

  it("renders catalog variant with responsive grid classes", () => {
    const { container } = render(<LoadingState variant="catalog" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toMatch(/grid/);
    expect(wrapper?.className).toMatch(/grid-cols-1/);
    expect(wrapper?.className).toMatch(/sm:grid-cols-2/);
    expect(wrapper?.className).toMatch(/lg:grid-cols-3/);
  });

  it("renders list variant", () => {
    const { container } = render(<LoadingState variant="list" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toMatch(/space-y-3/);
  });

  it("renders form variant", () => {
    const { container } = render(<LoadingState variant="form" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toMatch(/space-y-4/);
  });

  it("merges custom className", () => {
    const { container } = render(<LoadingState className="custom-x" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toContain("custom-x");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/loading-state.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/loading-state.tsx` with the body from §5.3.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/loading-state.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/loading-state.tsx apps/web/src/components/primitives/loading-state.test.tsx
git commit -m "feat(WINE-187): add LoadingState primitive with variants"
```

---

### Task 4: Create `<ErrorState>`

**Files:**
- Create: `apps/web/src/components/primitives/error-state.tsx`
- Create: `apps/web/src/components/primitives/error-state.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/error-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("renders default title and message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/couldn't load/i)).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(<ErrorState title="Boom" message="kaboom" />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.getByText("kaboom")).toBeInTheDocument();
  });

  it("renders Retry only when onRetry is provided", () => {
    const { rerender } = render(<ErrorState />);
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
    rerender(<ErrorState onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("fires onRetry when Retry is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("has role=alert", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/error-state.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/error-state.tsx` with the body from §5.4.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/error-state.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/error-state.tsx apps/web/src/components/primitives/error-state.test.tsx
git commit -m "feat(WINE-187): add ErrorState primitive"
```

---

### Task 5: Create `<EmptyState>`

**Files:**
- Create: `apps/web/src/components/primitives/empty-state.tsx`
- Create: `apps/web/src/components/primitives/empty-state.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/empty-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders default title and message", () => {
    render(<EmptyState />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("There's nothing to show.")).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(<EmptyState title="No wines" message="Add one to get started" />);
    expect(screen.getByText("No wines")).toBeInTheDocument();
    expect(screen.getByText("Add one to get started")).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<EmptyState action={<button type="button">Add</button>} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("has the empty-state data slot", () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector("[data-slot='empty-state']")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/empty-state.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/empty-state.tsx` with the body from §5.5.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/empty-state.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/empty-state.tsx apps/web/src/components/primitives/empty-state.test.tsx
git commit -m "feat(WINE-187): add EmptyState primitive"
```

---

### Task 6: Create `<DescriptionList>` + `<PropertyRow>`

**Files:**
- Create: `apps/web/src/components/primitives/description-list.tsx`
- Create: `apps/web/src/components/primitives/description-list.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/description-list.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList, PropertyRow } from "./description-list";

describe("DescriptionList + PropertyRow", () => {
  it("renders rows", () => {
    render(
      <DescriptionList>
        <PropertyRow label="Region" value="Tokaj" />
        <PropertyRow label="Vintage" value="2021" />
      </DescriptionList>,
    );
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Tokaj")).toBeInTheDocument();
    expect(screen.getByText("Vintage")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
  });

  it("renders dt and dd elements", () => {
    const { container } = render(
      <DescriptionList>
        <PropertyRow label="X" value="Y" />
      </DescriptionList>,
    );
    expect(container.querySelector("dl")).not.toBeNull();
    expect(container.querySelector("dt")?.textContent).toBe("X");
    expect(container.querySelector("dd")?.textContent).toBe("Y");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/description-list.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/description-list.tsx` with the body from §5.6.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/description-list.test.tsx
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/description-list.tsx apps/web/src/components/primitives/description-list.test.tsx
git commit -m "feat(WINE-187): add DescriptionList and PropertyRow primitives"
```

---

### Task 7: Create `<DataGrid>`

**Files:**
- Create: `apps/web/src/components/primitives/data-grid.tsx`
- Create: `apps/web/src/components/primitives/data-grid.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/data-grid.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataGrid } from "./data-grid";

describe("DataGrid", () => {
  it("renders catalog variant by default", () => {
    const { container } = render(
      <DataGrid>
        <div>a</div>
      </DataGrid>,
    );
    const grid = container.firstElementChild;
    expect(grid?.className).toMatch(/grid-cols-1/);
    expect(grid?.className).toMatch(/sm:grid-cols-2/);
    expect(grid?.className).toMatch(/lg:grid-cols-3/);
  });

  it("renders gallery variant", () => {
    const { container } = render(
      <DataGrid variant="gallery">
        <div>a</div>
      </DataGrid>,
    );
    expect(container.firstElementChild?.className).toMatch(/lg:grid-cols-4/);
  });

  it("renders list variant", () => {
    const { container } = render(
      <DataGrid variant="list">
        <div>a</div>
      </DataGrid>,
    );
    expect(container.firstElementChild?.className).toMatch(/grid-cols-1/);
    expect(container.firstElementChild?.className).not.toMatch(/sm:grid-cols-/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/data-grid.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/data-grid.tsx` with the body from §5.7.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/data-grid.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/data-grid.tsx apps/web/src/components/primitives/data-grid.test.tsx
git commit -m "feat(WINE-187): add DataGrid primitive with variants"
```

---

### Task 8: Create `useIsOwner` hook

**Files:**
- Create: `apps/web/src/hooks/useIsOwner.ts`
- Create: `apps/web/src/hooks/useIsOwner.test.ts`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/hooks/useIsOwner.test.ts`:

```tsx
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useIsOwner } from "./useIsOwner";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

import { useUser } from "@/context/UserContext";

const mockUseUser = vi.mocked(useUser);

describe("useIsOwner", () => {
  it("returns false when user is null", () => {
    mockUseUser.mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: "u1" }));
    expect(result.current).toBe(false);
  });

  it("returns false when ownerUserId is null", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: null }));
    expect(result.current).toBe(false);
  });

  it("returns true when user.id matches ownerUserId", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: "u1" }));
    expect(result.current).toBe(true);
  });

  it("returns false when ids differ", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: "u2" }));
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/hooks/useIsOwner.test.ts
```

Expected: FAIL with module-not-found on `./useIsOwner`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/hooks/useIsOwner.ts` with the body from §5.8.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/hooks/useIsOwner.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/hooks/useIsOwner.ts apps/web/src/hooks/useIsOwner.test.ts
git commit -m "feat(WINE-187): add useIsOwner hook"
```

---

### Task 9: Create `<ShowOwner>` render gate

**Files:**
- Create: `apps/web/src/components/primitives/show-owner.tsx`
- Create: `apps/web/src/components/primitives/show-owner.test.tsx`

- [ ] **Step 1: Write the failing test**

Write to `apps/web/src/components/primitives/show-owner.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShowOwner } from "./show-owner";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

import { useUser } from "@/context/UserContext";

const mockUseUser = vi.mocked(useUser);

describe("ShowOwner", () => {
  it("renders children when user.id matches ownerUserId", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    render(
      <ShowOwner ownerUserId="u1">
        <span>owner-only</span>
      </ShowOwner>,
    );
    expect(screen.getByText("owner-only")).toBeInTheDocument();
  });

  it("renders fallback when user.id does not match", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    render(
      <ShowOwner ownerUserId="u2" fallback={<span>not-owner</span>}>
        <span>owner-only</span>
      </ShowOwner>,
    );
    expect(screen.queryByText("owner-only")).toBeNull();
    expect(screen.getByText("not-owner")).toBeInTheDocument();
  });

  it("renders nothing by default when not owner", () => {
    mockUseUser.mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    const { container } = render(
      <ShowOwner ownerUserId="u1">
        <span>owner-only</span>
      </ShowOwner>,
    );
    expect(container.textContent).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
bun run --filter web test --run src/components/primitives/show-owner.test.tsx
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/primitives/show-owner.tsx` with the body from §5.9.

- [ ] **Step 4: Run test to verify it passes**

```powershell
bun run --filter web test --run src/components/primitives/show-owner.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/components/primitives/show-owner.tsx apps/web/src/components/primitives/show-owner.test.tsx
git commit -m "feat(WINE-187): add ShowOwner render gate"
```

---

### Task 10: Reference migration — `ProductPageSkeleton` uses `<LoadingState>`

**Files:**
- Modify: `apps/web/src/routes/-components/ProductPageSkeleton.tsx`

This is the ONE existing-file migration in P0. It proves `LoadingState` works in a real consumer; downstream tickets copy this shape.

- [ ] **Step 1: Read the current file**

```powershell
type "apps\web\src\routes\-components\ProductPageSkeleton.tsx"
```

Note its current export name and props.

- [ ] **Step 2: Replace the body**

Open `apps/web/src/routes/-components/ProductPageSkeleton.tsx`. Replace its content with:

```tsx
import { LoadingState } from "@/components/primitives/loading-state";

export function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8 lg:px-12">
      <LoadingState variant="detail" />
    </div>
  );
}
```

If the existing file exports something else or takes props that callers pass, do NOT change the export signature — only the body of the returned JSX. Match the existing export name and props. If you encounter different props, keep them as-is and pass through; do not break callers.

- [ ] **Step 3: Type-check and run all web tests**

```powershell
bun run --filter web check-types
bun run --filter web test --run
```

Expected: typecheck exit 0; all tests pass (the existing tests for routes that use `ProductPageSkeleton` must still pass).

- [ ] **Step 4: Visual verification (manual)**

```powershell
bun run --filter web dev
```

Open `http://localhost:5173/products/<any-id>` while the network is throttled or while the API is unreachable. Confirm the skeleton renders cleanly in BOTH light and dark theme. Compare with a screenshot of the OLD skeleton if you can.

- [ ] **Step 5: Commit**

```powershell
git add apps/web/src/routes/-components/ProductPageSkeleton.tsx
git commit -m "refactor(WINE-187): migrate ProductPageSkeleton to LoadingState primitive"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run all web tests**

```powershell
bun run --filter web test --run
```

Expected: All web tests pass. The 9 new test files contribute ≥30 new assertions.

- [ ] **Step 2: Run web type-check**

```powershell
bun run --filter web check-types
```

Expected: exit 0.

- [ ] **Step 3: Run biome on new files**

```powershell
bun run --filter web check
```

Expected: exit 0; if Biome rewrites whitespace/import order in your new files, accept those changes as part of the last commit OR add an amended commit `style(WINE-187): biome format new primitive files`.

- [ ] **Step 4: Confirm the commit log shape**

```powershell
git log --oneline -12
```

Expected: at least 10 commits prefixed `feat(WINE-187):` / `refactor(WINE-187):` since branching from `dev`. Spot check that each commit message is in conventional-commit form.

---

## 7. Verification gates

| Gate | Command (run from repo root) | Pass criterion |
|---|---|---|
| Unit tests (web) | `bun run --filter web test --run` | All tests pass |
| Type check (web) | `bun run --filter web check-types` | Exit 0 |
| Biome (web) | `bun run --filter web check` | Exit 0 |
| Manual dark-mode pass | `bun run --filter web dev` then toggle theme on `/products/<id>` while throttling network | Skeleton looks correct in both themes |

**Not run, intentionally:**
- `bun run validate` — fails on Windows due to dev's vitest 4 + zod 4 ESM regression (Linux CI passes). Tracked in the BE backlog ticket; not P0's concern.
- `bun run build` — pre-existing zod/Orval drift on `dev`. Same ticket.
- Server-side tests — out of scope for FE primitives.

---

## 8. Risks and open decisions

- **`LoadingState` skeleton sizes are guesses.** They look right in isolation but real screens may want different aspect ratios. Acceptable; tweak per-cluster ticket if needed. The variant API is stable so tweaks live in this file.
- **`ShowOwner` only checks user-id ownership; it does NOT check role.** A user who used to be a winemaker but lost the role can still own wines whose `winemakerId.userId` matches. Decision: ownership is sufficient — losing the role is a BE-side data integrity issue, not a FE gate concern. Re-evaluate if BE introduces a "role revocation" flow.
- **No `useIsAdmin` / `useIsRole` helpers in P0.** Existing role checks go through Clerk's `<Show>` + `useUser().activeRole`. `useIsOwner` is orthogonal: it's "MY resource?" not "MY role?". A future ticket may add `useHasRole(role)` if reuse appears.
- **Tests assert Tailwind class strings.** This is brittle — if Tailwind utility names change in a major version bump, tests need updating. Acceptable for now; we'd rather catch a class swap accidentally than not catch it at all.

---

## 9. Success criteria

The plan is complete when:

1. The 8 primitive files and 1 hook file from §4.1 exist and export the components defined in §5.
2. The corresponding 9 test files exist and pass.
3. `bun run --filter web test --run` passes.
4. `bun run --filter web check-types` exits 0.
5. `apps/web/src/routes/-components/ProductPageSkeleton.tsx` uses `<LoadingState variant="detail" />`.
6. The branch has ≥10 conventional commits prefixed `feat(WINE-187):` / `refactor(WINE-187):` / `test(WINE-187):`.
7. Adam visually confirms `/products/<id>` skeleton looks correct in both themes.

After this plan lands, the cluster tickets (WINE-173 → WINE-180) consume these primitives and migrate their routes accordingly.
