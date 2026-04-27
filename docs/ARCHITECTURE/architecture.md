# System Architecture — WineMarket

## Three-Layer Backend Architecture

```
HTTP Routes Layer (Elysia)
    ↓ Input validation, route handling
Service Layer (Business logic)
    ↓ Orchestration, transactions
Repository Layer (DB access)
    ↓ Pure queries, no logic
Database (PostgreSQL + Drizzle)
```

## Module Structure

```
apps/server/src/
├── modules/
│   ├── auth/           (authPlugin macro — Clerk JWT validation)
│   ├── users/
│   ├── wines/
│   ├── winemakers/
│   ├── shops/
│   ├── products/
│   ├── carts/
│   ├── orders/
│   ├── events/
│   ├── reviews/
│   ├── admin/
│   ├── availability/
│   ├── guest-sessions/
│   ├── role-requests/
│   ├── supply-agreements/
│   └── (each module: routes, service, repository, schema, index.ts)
├── db/
│   ├── schema.ts (Drizzle — source of truth)
│   └── migrations/
└── utils/
    ├── auth.ts
    └── errors.ts    (shared handleError — maps service error strings to HTTP status)
```

## Key Principles

- **Single Responsibility**: Each layer has one job
  - Routes: HTTP handling only
  - Services: Business logic only
  - Repositories: DB queries only

- **No Direct Repository Calls from Routes**: Always through service

- **Zod Schemas as Single Source of Truth**
  - Types + validation + OpenAPI

- **Role-Based Access Control**
  - Every service method checks roles (see ROLES/roles.md)

## Frontend Architecture

- **File-based Routing** (TanStack Router)
- **Component Isolation** (`-components/`, `-hooks/`)
- **API Integration** (Orval-generated hooks from OpenAPI)
- **State Management** (TanStack Query for server state)
- **Auth** (Clerk — replaces custom JWT/bcrypt; session injected via `authPlugin` macro)

## Database Design

21+ entities covering:
- Users (5 roles)
- Catalog (wines, products, bundles)
- Commerce (carts, orders, items)
- Features (events, reviews, comments)
- Support (addresses, availability, sessions)

## Data Flow

```
Database Schema → Drizzle ORM → Service Layer → API Routes
    ↓
OpenAPI Spec (auto-generated via @elysiajs/openapi + Scalar)
    ↓
Orval Code Generation  (bun run generate)
    ↓
React Hooks (apps/web/src/generated/)
    ↓
Frontend Components
```

See ARCHITECTURE folder for detailed diagrams (PlantUML).

## Error Handling Convention

Services throw plain `Error` instances with string codes (`"NOT_FOUND"`, `"FORBIDDEN"`, `"NOT_PENDING"`, `"NOT_PURCHASED"`, `"ALREADY_REVIEWED"`, `"CART_EMPTY"`, `"INSUFFICIENT_STOCK"`, `"INVALID_TRANSITION"`, `"MISSING_SHIPPING_ADDRESS"`, `"MISSING_BILLING_ADDRESS"`).

Routes catch and delegate to the shared `handleError(e)` utility in `utils/errors.ts`, which maps each code to the correct HTTP status. Do not inline `e.message === "..."` comparisons in routes.

## Auth Pattern (Clerk)

Auth is handled via `authPlugin` (Elysia macro in `modules/auth/`). Routes declare:
- `requireAuth: true` — valid Clerk JWT required, injects `dbUser` and `clerkPayload` into context
- `requireRoles: ["admin"]` — role check on top of auth

Never call Clerk SDK directly in routes. Auth context is injected by the macro.

## Code Quality

- **Linter/Formatter:** Biome (strict — all rules are `"error"`, no `"warn"` except intentional suppressions)
- **No `any`:** Use `biome-ignore lint/suspicious/noExplicitAny: <reason>` when Elysia type inference requires it
- **Imports:** `useImportType` enforced — always `import type` for type-only imports
- **Console:** `noConsole` enforced — use proper logging or remove before committing

## Revision History
- **v1.0** (Week 6) — Initial system architecture design
- **v1.1** (Week 8) — Auth module implemented with Clerk (replacing JWT/bcrypt plan)
- **v1.2** (Week 10) — All 15 backend modules implemented and wired; guest-sessions added
- **v1.3** (Week 11) — Error handling convention standardized; Biome strict rules enforced; all 15 modules wired
