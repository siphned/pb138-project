# Frontend Route Structure

## Overview
TanStack Router file-based routing structure for WineMarket frontend.

## Files
- `routes.md` — Complete route specification
  - Full hierarchy with role-based access
  - Component organization (`-components/`, shared components)
  - Dark mode and responsive design
  - API hook integration

- `route_hierarchy.puml` — Route navigation diagram
  - Public routes (home, catalog, events)
  - Auth routes (login, register)
  - Role-specific dashboards
  - Admin back-office

## Route Organization

### Public Routes (Guest + All)
- `/` (home)
- `/wines`, `/wines/:id` (catalog)
- `/winemakers`, `/shops`, `/events` (browsing)

### Authenticated Routes (Customer)
- `/cart` (shopping cart)
- `/checkout` (authenticated checkout)
- `/dashboard/*` (customer profile)
- `/winemaker/*` (if winemaker role)
- `/shop/*` (if shop owner role)

### Admin Routes
- `/admin/*` (admin back-office)

## Component Pattern

Private components scoped to route:
```
/wines
├── -components/
│   ├── WineCard.tsx
│   └── WineFilter.tsx
```

Shared components in root:
```
/components
├── /ui (shadcn/ui)
└── /layout (Header, Sidebar, Footer)
```

## Key Features
- **Dark mode** via Tailwind
- **Mobile-first** responsive  design
- **Kubb integration** for API type safety
- **TanStack Query** for server state
- **File-based routing** (no route config needed)

## Related Documentation
See `/docs/` for:
- **API/** — API endpoint specification
- **ROLES/** — Role-permission matrix (authorization rules)
- **ARCHITECTURE/** — System design and layering patterns

## For Adam (Frontend Developer)
Build pages matching this structure. Use Kubb hooks for all API calls.

## Revision History
- **v1.0** (Week 6) — Frontend routing structure
