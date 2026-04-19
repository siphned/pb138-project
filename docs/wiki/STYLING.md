# Tailwind CSS & shadcn/ui

## Tailwind CSS Fundamentals

**Utility-first CSS framework** — compose styles directly in markup using utility classes.

### Why Tailwind?

| Traditional CSS | Tailwind |
|---|---|
| `.card { padding: 16px; ... }` (new file) | `className="p-4 bg-white rounded-lg"` (inline) |
| Switch between files constantly | No context switching |
| Naming everything | No naming overhead |
| Large bundle | Dead code elimination → ship only used classes |

---

## Setup in Vite + React

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

---

## Core Utilities

### Spacing & Sizing

```tsx
<div className="p-4 m-2">           {/* padding: 16px, margin: 8px */}
<div className="px-6 py-3">         {/* padding-left/right: 24px, top/bottom: 12px */}
<div className="w-10 h-10">         {/* width: 40px, height: 40px */}
<div className="w-full h-screen">   {/* width: 100%, height: 100vh */}
```

**Spacing scale:** 1 = 4px, 2 = 8px, 4 = 16px, 6 = 24px, 8 = 32px...

### Typography

```tsx
<h1 className="text-3xl font-bold">Big Title</h1>
<p className="text-sm text-gray-500">Muted text</p>
<span className="uppercase tracking-wide">CAPS</span>
```

### Colors & Backgrounds

```tsx
<div className="bg-blue-500 text-white">Blue box</div>
<div className="bg-gray-100 text-gray-900">Light card</div>
<div className="border border-gray-200 rounded-lg">Bordered</div>
<div className="shadow-lg">With shadow</div>
```

**Color scale:** 50 (lightest) → 950 (darkest)

### Borders & Radius

```tsx
<div className="border border-2 border-gray-300">Thin border</div>
<div className="rounded-lg">Rounded corners</div>
<div className="rounded-full">Circle</div>
```

---

## Flexbox Layout

```tsx
{/* Horizontal layout with spacing */}
<div className="flex items-center gap-4">
  <img src="avatar.png" className="w-10 h-10 rounded-full" />
  <div>
    <p className="font-bold">Alice</p>
    <p className="text-sm text-gray-500">Online</p>
  </div>
</div>

{/* Space between — perfect for headers */}
<div className="flex justify-between items-center">
  <h2>Title</h2>
  <button>Action</button>
</div>

{/* Centering */}
<div className="flex items-center justify-center h-screen">
  <p>Dead center</p>
</div>

{/* Vertical layout */}
<div className="flex flex-col gap-2">
  <p>First</p>
  <p>Second</p>
</div>
```

### Common Flexbox Patterns

| Pattern | Classes |
|---|---|
| Center all | `flex items-center justify-center` |
| Space between | `flex justify-between` |
| Gap between items | `flex gap-4` |
| Vertical | `flex flex-col` |
| Wrap | `flex flex-wrap` |
| Align top | `flex items-start` |

---

## CSS Grid

```tsx
{/* 3-column grid */}
<div className="grid grid-cols-3 gap-4">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

{/* Responsive: 1 col → 2 → 3 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* grid items */}
</div>

{/* Auto-fill with minimum width */}
<div className="grid auto-cols-max gap-4">
  {/* columns scale automatically */}
</div>
```

---

## Responsive Design

Mobile-first breakpoints:

| Prefix | Min-width | Device |
|---|---|---|
| (none) | 0px | Mobile |
| `sm:` | 640px | Large phone |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide screen |

```tsx
{/* Default: mobile. Add breakpoints to override upward. */}
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

{/* 1 col on mobile, 2 on tablet, 3 on laptop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>
```

---

## Interactive States

```tsx
{/* Hover & focus */}
<button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>

{/* Disabled state */}
<button disabled className="disabled:opacity-50 disabled:cursor-not-allowed">
  Disabled
</button>

{/* Input focus */}
<input
  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Focus me"
/>

{/* Group hover — hover parent to style child */}
<div className="group border">
  <h3>Title</h3>
  <p className="text-gray-500 group-hover:text-gray-900">Details</p>
</div>
```

---

## Component Abstraction

**Don't repeat utility strings.** Extract to reusable components.

### ❌ Anti-Pattern
```tsx
// Duplicated across the app
<span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
  Developer
</span>
```

### ✅ Good Pattern
```tsx
function RoleBadge({ role, variant = "default" }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
      {role}
    </span>
  );
}

<RoleBadge role="Developer" />
<RoleBadge role="Designer" variant="secondary" />
```

This is **React + Tailwind synergy** — components are your abstraction, not CSS classes.

---

## Semantic Colors

Define semantic variables instead of hardcoding color scales everywhere.

```css
/* index.css */
@theme {
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-600);
  --color-destructive: var(--color-red-500);
  --color-success: var(--color-green-500);
}
```

```tsx
{/* Now change color scheme in one place */}
<button className="bg-primary hover:bg-primary-hover">Save</button>
<button className="bg-destructive">Delete</button>
<button className="bg-success">Confirm</button>
```

**shadcn/ui does this automatically** with `primary`, `secondary`, `destructive`, etc.

---

## Dark Mode

Tailwind supports dark mode via `dark:` prefix.

```tsx
{/* Light mode (default), dark mode override */}
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adapts to system preference
</div>
```

Enable in `tailwind.config.js`:
```ts
export default {
  darkMode: "media", // respects system preference
  // or "class" to toggle via className on <html>
}
```

---

# shadcn/ui

**Not a component library.** A collection of components you **copy into your project** and own.

| Traditional Library | shadcn/ui |
|---|---|
| `npm install @ui/library` | `npx shadcn add button card` |
| Styling locked | You own the source code |
| Heavy bundle | Only what you use |

Built on **Radix UI** (or Base UI) primitives + **Tailwind CSS** for styling.

---

## Setup

```bash
npx shadcn@latest init
```

Creates:
- `components.json` — configuration
- `src/components/ui/` — component directory
- `src/lib/utils.ts` — `cn()` helper for merging classes

---

## Adding Components

```bash
npx shadcn@latest add button card input badge separator
```

Opens your browser to select which components to add. Then they're copied into `src/components/ui/`.

```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

---

## Common Components

### Button
```tsx
<Button>Click me</Button>
<Button disabled>Disabled</Button>
<Button variant="destructive">Delete</Button>
<Button className="w-full">Full width</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

<Card className="w-80">
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
  </CardHeader>
  <CardContent>
    <p>You have 3 unread messages.</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full">View All</Button>
  </CardFooter>
</Card>
```

### Input
```tsx
import { Input } from "@/components/ui/input";

<Input placeholder="Search..." />
<Input type="email" placeholder="your@email.com" />
<Input disabled placeholder="Disabled" />
```

### Badge
```tsx
import { Badge } from "@/components/ui/badge";

<Badge>React</Badge>
<Badge variant="secondary">TypeScript</Badge>
<Badge variant="outline">Tailwind</Badge>
<Badge variant="destructive">Breaking</Badge>
```

### Separator
```tsx
import { Separator } from "@/components/ui/separator";

<h2>Section 1</h2>
<Separator className="my-4" />
<h2>Section 2</h2>
```

---

## The `cn()` Helper

Merges Tailwind classes and **resolves conflicts** (rightmost wins).

```tsx
// In shadcn components — allows consumers to override styles
function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("px-4 py-2 bg-blue-500 text-white rounded", className)}
      {...props}
    />
  );
}

// Usage — override styles without conflicts
<Button className="bg-red-500">Delete</Button>  // red, not blue
<Badge className={cn("text-sm", isActive && "bg-green-100")} />
```

Import from `@/lib/utils`:
```tsx
import { cn } from "@/lib/utils";
```

---

## Customization

Edit `src/components/ui/button.tsx` — you own it. Change colors, sizing, behavior.

```tsx
// All shadcn components are just TypeScript files
function Button({ variant = "default", size = "default", ...props }) {
  // Your code — fully customizable
}
```

This is the entire point of shadcn — **no magic, no lock-in, just copy-paste control**.

---

## Related Pages

- [REACT.md](REACT.md) — Building components with React
- [ROUTING.md](ROUTING.md) — Organizing styled components into pages
- [AI_DEV.md](AI_DEV.md) — Generating UI with AI assistance
