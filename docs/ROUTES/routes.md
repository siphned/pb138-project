# Frontend Route Structure

## Route Hierarchy

```
/                    (home, public)
├── /wines           (catalog, public)
├── /wines/:id       (detail, public)
├── /winemakers      (browse, public)
├── /winemakers/:id  (profile, public)
├── /shops           (browse, public)
├── /shops/:id       (detail, public)
├── /events          (listing, public)
└── /events/:id      (detail, public)

/auth
├── /auth/login      (form)
└── /auth/register   (form)

/cart                (guest + user)

/checkout            (customer+ only)

/orders              (customer+ only)
├── /orders/:id      (detail)

/dashboard           (customer+ only)
├── /dashboard/profile
├── /dashboard/addresses
└── /dashboard/role-request

/winemaker           (winemaker role)
├── /winemaker/wines
├── /winemaker/wines/:id
├── /winemaker/events
└── /winemaker/events/:id

/shop                (shop owner role)
├── /shop/products
├── /shop/products/:id
├── /shop/bundles
├── /shop/bundles/:id
├── /shop/hours
└── /shop/orders

/admin               (admin role)
├── /admin/users
├── /admin/role-requests
├── /admin/events
├── /admin/reviews
└── /admin/statistics
```

---

## Component Organization

### Private Components (`-components/`)
Route-scoped, not imported elsewhere:

```
/wines
├── -components/
│   ├── WineCard.tsx
│   ├── WineFilter.tsx
│   └── WineDetail.tsx

/admin
├── -components/
│   ├── UserTable.tsx
│   ├── EventApprovalBoard.tsx
│   └── ReviewModerator.tsx
```

### Shared Components (`/components/`)
Global, imported from anywhere:

```
/components/ui/       (shadcn/ui)
  ├── button.tsx
  ├── card.tsx
  ├── modal.tsx
  └── (etc.)

/components/layout/   (Shared layouts)
  ├── Header.tsx
  ├── Sidebar.tsx
  └── Footer.tsx
```

---

## Role-Based Access

| Route | Guest | Customer | Winemaker | Shop Owner | Admin |
|-------|-------|----------|-----------|------------|-------|
| / | ✅ | ✅ | ✅ | ✅ | ✅ |
| /wines | ✅ | ✅ | ✅ | ✅ | ✅ |
| /checkout | ❌ | ✅ | ✅ | ✅ | ❌ |
| /dashboard/* | ❌ | ✅ | ✅ | ✅ | ❌ |
| /winemaker/* | ❌ | ❌ | ✅ | ❌ | ✅ |
| /shop/* | ❌ | ❌ | ❌ | ✅ | ✅ |
| /admin/* | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Dark Mode Support

Every page has light/dark theme support:

```typescript
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  Content
</div>
```

Theme toggle in Header component.

---

## Mobile Responsiveness

All routes support:
- Mobile: < 640px (full width, bottom nav)
- Tablet: 640-1024px (centered, hidden sidebar)
- Desktop: > 1024px (sidebar visible, full layout)

Use Tailwind responsive classes: `sm:`, `md:`, `lg:`, `xl:`

---

## API Integration

Every route uses Kubb-generated hooks:

```typescript
import { useGetWines, useCreateWine } from '@repo/api/hooks';

export default function WineCatalog() {
  const { data: wines } = useGetWines({ region: 'Burgundy' });
  return <WineList wines={wines} />;
}
```

Types auto-generated from OpenAPI spec (see ../API/api.md).

---

## Loading, Error, Empty States

Every page should handle:
```
isLoading → Skeleton/Spinner
error → Error alert + retry button
data.length === 0 → Empty state message
data → Render content
```

---

## Revision History
- **v1.0** (Week 6) — Frontend route structure from PRD
