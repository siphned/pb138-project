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
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.schema.ts
│   │   └── index.ts
│   ├── users/
│   ├── wines/
│   ├── (etc. for each module)
├── db/
│   ├── schema.ts (Drizzle)
│   └── migrations/
└── utils/
    ├── auth.ts
    └── errors.ts
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
- **API Integration** (Kubb-generated hooks from OpenAPI)
- **State Management** (TanStack Query for server state)

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
OpenAPI Spec (auto-generated)
    ↓
Kubb Code Generation
    ↓
React Hooks (@repo/api)
    ↓
Frontend Components
```

See ARCHITECTURE folder for detailed diagrams (PlantUML).

## Revision History
- **v1.0** (Week 6) — Initial system architecture design
