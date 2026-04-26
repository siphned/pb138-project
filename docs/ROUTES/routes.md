# Frontend Route Structure

## Route Hierarchy

Routes are file-based (TanStack Router). The actual route files in `apps/web/src/routes/`:

```
/                         index.tsx (public — home/landing)
├── /explore              explore.tsx (public — wine catalog)
├── /search               search.tsx (public)
├── /events               events.tsx (public)
├── /cart                 cart.tsx (public — guest + user)

/auth
├── /auth/login           auth/login.tsx (Clerk SignIn)
└── /auth/register        auth/register.tsx (Clerk SignUp)

_authenticated            (pathless layout guard — requires Clerk session)
├── /dashboard            _authenticated.dashboard.tsx
├── /orders               _authenticated.orders.tsx
├── /settings             _authenticated.settings.tsx

  _authenticated._winemaker   (pathless — winemaker role)
  ├── /winemaker/supply       _authenticated._winemaker.supply.tsx
  └── /winemaker/wines        _authenticated._winemaker.wines.tsx

  _authenticated._shop_owner  (pathless — shop_owner role)
  ├── /shops                  _authenticated._shop_owner.shops.index.tsx
  └── /shops/$id
      ├── /shops/$id/         _authenticated._shop_owner.shops.$id.tsx
      ├── /shops/$id/inventory        shops.$id.inventory.tsx
      ├── /shops/$id/bundles          shops.$id.bundles.tsx
      ├── /shops/$id/shop-orders      shops.$id.shop-orders.tsx
      └── /shops/$id/supply-browse    shops.$id.supply-browse.tsx

  _authenticated._admin       (pathless — admin role)
  ├── /admin                  _authenticated._admin.admin.tsx
  ├── /admin/moderation       _authenticated._admin.moderation.tsx
  ├── /admin/role-requests    _authenticated._admin.role-requests.tsx
  └── /admin/users            _authenticated._admin.users.tsx
```

**Note:** `/admin/statistics` was deferred and is not implemented. `/winemaker/events` is not yet a separate route (events live at `/events`). `/checkout` is not yet a separate route file.

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
| /checkout | ✅ | ✅ | ✅ | ✅ | ✅ |
| /dashboard/* | ❌ | ✅ | ✅ | ✅ | ✅ |
| /winemaker/* | ❌ | ❌ | ✅ | ❌ | ✅ |
| /shops/:id/* | ❌ | ❌ | ❌ | 🔒 | ✅ |
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

Every route uses Orval-generated hooks:

```typescript
import { useGetWines, useCreateWine } from '@/generated/wines/wines';

export default function WineCatalog() {
  const { data: wines } = useGetWines({ region: 'Burgundy' });
  return <WineList wines={wines} />;
}
```

Generated files live in `apps/web/src/generated/` (excluded from Biome linting and TypeScript strict checks). Regenerate after backend changes with `bun run generate`. Config: `apps/web/orval.config.ts`.

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
- **v1.1** (Week 8) — Updated for multiple shops and guest checkout
- **v1.2** (Week 11) — Route tree updated to match actual implemented files; admin/statistics deferred noted; pathless layout guards documented
