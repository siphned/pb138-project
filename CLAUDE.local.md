# Adam's Personal FE Rules (gitignored)

## How to use this file

Read this file before editing anything under `apps/web/**`. Treat every rule below as a hard rule unless Adam explicitly tells you otherwise in the current conversation. When a rule mentions a wiki page, defer to that wiki page for deeper context — this file is intentionally short and does not duplicate wiki content.

If you spot a violation that is not yet listed under "Known violations" at the bottom, add a line for it before doing anything else.

---

## A. Component hygiene

### A1. Never reimplement shadcn primitives

**Rule:** If you need a Button, Card, Skeleton, Dialog, Input, Select, Tabs, Sheet, Dropdown, Form, Table, Avatar, Badge, Accordion, Carousel, Checkbox, Label, Separator, Slider, or Textarea — import it from `@/components/ui/<name>`. Never write your own.

**Why:** shadcn handles a11y, dark mode, focus rings, and keyboard nav. Hand-rolled replacements always drop one of those and create cascade conflicts the day shadcn is later added.

**Do this:**
```tsx
import { Button } from "@/components/ui/button";
<Button variant="outline" size="sm">Add to cart</Button>
```

**Don't do this:**
```tsx
<button className="rounded-md border px-3 py-1 hover:bg-gray-100">
  Add to cart
</button>
```

→ See `wiki/STYLING.md`.

### A2. Single source for primitives = `apps/web/src/components/{ui,primitives}/`

**Rule:**
- `components/ui/` — shadcn primitives only. Anything installed via `bunx shadcn@latest add <name>` lives here. Do not edit these files except where shadcn explicitly supports it (e.g. tweaking a CVA variant). Do not put custom files here.
- `components/primitives/` — app-specific primitives built on top of shadcn or from scratch using `cn()` and Base UI `useRender`. `<NavItem>`, `<SectionLabel>`, etc.
- `components/{feature}/` (e.g. `catalog/`, `dashboard/`, `layout/`, `reviews/`) — domain components that combine primitives with feature logic.

**Why:** Two locations for primitives = imports race each other, autocomplete picks the wrong one, theme drifts. Splitting `ui/` (shadcn-managed) and `primitives/` (hand-written) keeps the shadcn CLI safe to re-run and gives custom primitives a clear home.

**Do this:**
```tsx
import { Card } from "@/components/ui/card";          // shadcn
import { NavItem } from "@/components/primitives/nav-item"; // app primitive
import { ProductCard } from "@/components/catalog/ProductCard"; // domain
```

**Don't do this:**
```tsx
import { NavItem } from "@/components/ui/nav-item";    // wrong folder
import { Card } from "@/components/primitives/card";   // wrong folder
```

→ See `wiki/STYLING.md`.

### A3. Install missing shadcn parts before composing

**Rule:** If `@/components/ui/<name>` does not exist for a primitive shadcn provides, run `bunx --bun shadcn@latest add <name>` from `apps/web/` first. Only then build composite components on top of it.

**Why:** Avoids the temptation to inline a "temporary" version that becomes permanent.

**Do this:**
```bash
cd apps/web && bunx --bun shadcn@latest add skeleton
```
```tsx
import { Skeleton } from "@/components/ui/skeleton";
<Skeleton className="h-6 w-32" />
```

**Don't do this:**
```tsx
<div className="h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
```

→ See `wiki/STYLING.md`.

### A4. `packages/ui/` is dead — do not import, do not add files

**Rule:** The `@repo/ui` workspace package was a Turborepo starter scaffold. It has been deleted. Do not recreate it, do not import from it, do not add files to a `packages/ui/` directory.

**Why:** Its `Button` was a `console.log` joke component. Anything in that package is junk by default.

**Do this:**
```tsx
import { Button } from "@/components/ui/button";
```

**Don't do this:**
```tsx
import { Button } from "@repo/ui/button";
```

### A5. Custom domain components live in `components/{feature}/`

**Rule:** Cross-route domain components go in their named feature folder under `apps/web/src/components/` (e.g. `catalog/`, `dashboard/`, `layout/`, `reviews/`). `ui/` is reserved for shadcn primitives only.

**Why:** Keeps shadcn `ui/` upgradeable via the CLI without overwriting custom code.

**Do this:** `apps/web/src/components/catalog/ProductCard.tsx`

**Don't do this:** `apps/web/src/components/ui/ProductCard.tsx`

→ See `wiki/REACT.md`.

### A6. Icons come from `hugeicons` (per `components.json`)

**Rule:** Icon imports come from `hugeicons-react`. Do not introduce `lucide-react`, `react-icons`, `@heroicons/react`, or any other icon library.

**Why:** `apps/web/components.json` pins `iconLibrary: hugeicons`; mixing libraries means inconsistent stroke widths, sizing, and bundle bloat.

**Do this:**
```tsx
import { ShoppingCart01Icon } from "hugeicons-react";
```

**Don't do this:**
```tsx
import { ShoppingCart } from "lucide-react";
```

→ See `wiki/STYLING.md`.

---

## B. Styling

### B1. No hand-rolled skeletons

**Rule:** Loading placeholders use `<Skeleton>` from `@/components/ui/skeleton`. The combination of `animate-pulse` plus a `bg-*` placeholder div is forbidden.

**Why:** Hand-rolled skeletons miss the theme-aware muted background and break in dark mode.

**Do this:**
```tsx
import { Skeleton } from "@/components/ui/skeleton";
<Skeleton className="h-6 w-32" />
```

**Don't do this:**
```tsx
<div className="h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
```

→ See `wiki/STYLING.md`.

### B2. No hardcoded colors — use design tokens

**Rule:** Color classes must use the semantic shadcn / Tailwind tokens: `bg-background`, `bg-muted`, `bg-card`, `bg-primary`, `bg-destructive`, `text-foreground`, `text-muted-foreground`, `border-border`, etc. Concrete palette values (`bg-gray-200`, `text-black`, `text-white`, `border-gray-300`) are forbidden.

**Why:** Hardcoded values break dark mode and theme switching. Tokens follow the CSS variables defined in `apps/web/src/index.css`.

**Do this:**
```tsx
<div className="bg-muted text-muted-foreground border-border" />
```

**Don't do this:**
```tsx
<div className="bg-gray-200 text-black border-gray-300" />
```

→ See `wiki/STYLING.md`.

### B3. Dark mode parity required for every visible element

**Rule:** Any color, border, shadow, or background you introduce must look correct in both light and dark theme. Use semantic tokens by default; if a token is not enough, add explicit `dark:` variants.

**Why:** The project requires full light/dark theme support. Half-themed pages count as bugs.

**Do this:**
```tsx
<div className="bg-card text-card-foreground" />
{/* or, when a token doesn't fit: */}
<div className="bg-white dark:bg-zinc-900" />
```

**Don't do this:**
```tsx
<div className="bg-white" />  // light-only, breaks dark mode
```

→ See `wiki/STYLING.md`.

### B4. Tailwind classes via `cn()` helper, not string concat

**Rule:** Conditional or composed class strings go through `cn()` from `@/lib/utils`. Never use template strings or `+` concatenation for classes.

**Why:** `cn()` deduplicates conflicting Tailwind classes via `tailwind-merge`. String concat does not, leading to silent specificity bugs.

**Do this:**
```tsx
import { cn } from "@/lib/utils";
<div className={cn("rounded-md p-2", isActive && "bg-primary text-primary-foreground")} />
```

**Don't do this:**
```tsx
<div className={"rounded-md p-2 " + (isActive ? "bg-primary text-primary-foreground" : "")} />
```

→ See `wiki/STYLING.md`.

### B5. No inline `style={}` unless the value is dynamic and Tailwind cannot express it

**Rule:** Default to Tailwind classes. Fall back to `style={{...}}` only when the value is computed at runtime (e.g. a percentage from props for a progress bar) and no Tailwind utility maps to it.

**Why:** Inline styles bypass theme tokens, dark mode, and class-merge logic.

**Do this:**
```tsx
<div className="w-1/2" />                           {/* static value */}
<div style={{ width: `${percent}%` }} />            {/* dynamic, no Tailwind utility fits */}
```

**Don't do this:**
```tsx
<div style={{ padding: "8px", color: "#000" }} />   {/* both static, both expressible in Tailwind */}
```

→ See `wiki/STYLING.md`.

---

## Forbidden patterns (red flags)

If you see — or are about to write — any of the following, stop. You wrote it wrong.

| Pattern | Diagnosis | Fix |
|---|---|---|
| Raw `<button className="rounded ...">` styled like a Button | reimplemented Button | `<Button variant="..."/>` from `@/components/ui/button` |
| `animate-pulse` + `bg-secondary/20` (or any `bg-*`) divs | hand-rolled skeleton | `<Skeleton className="..."/>` |
| `bg-gray-*`, `text-black`, `text-white`, `border-gray-*` | hardcoded colors | semantic tokens: `bg-muted`, `text-foreground`, `border-border` |
| `import ... from "@repo/ui"` | dead package | use `@/components/ui/<name>` |
| Custom `Card` / `Dialog` / `Sheet` / `Tabs` wrapper | reinvented primitive | shadcn version from `@/components/ui/` |
| `style={{ color: "..." }}` with a static value | inline-style escape hatch | Tailwind class via `cn()` |
| `className={"a " + (cond ? "b" : "")}` | string concat for classes | `cn("a", cond && "b")` |
| New file under `packages/ui/src/` | adding to dead package | `apps/web/src/components/ui/` (shadcn) or `components/{feature}/` |
| Light-only colors with no dark-theme verification | broke dark mode | use semantic tokens or add `dark:` variant |
| Imports from `lucide-react` / `react-icons` / `@heroicons/react` | wrong icon library | `hugeicons-react` (per `components.json`) |

---

## Known violations (cleanup TODO)

- [ ] `apps/web/src/routes/-components/cart/CartItemRow.tsx` — imports `Wine, X` from `lucide-react` (violates A6). Replace with `hugeicons-react` equivalents.
- [ ] Audit other files under `apps/web/src/` for `lucide-react` imports — likely more A6 violations from the same era.
