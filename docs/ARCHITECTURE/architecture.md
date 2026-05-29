# System Architecture — WineMarket

## Overview

WineMarket is a multi-actor wine marketplace platform built with a 3-layer backend architecture and file-based frontend routing. The system connects winemakers, shop owners, customers, and admins in a unified platform with role-based access control, server-side guest sessions, and comprehensive moderation workflows.

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
- Users (5 roles, integrated with Clerk)
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
React Hooks (@repo/web/src/generated)
    ↓
Frontend Components
```

See ARCHITECTURE folder for detailed diagrams (PlantUML).

## Deployment Architecture

**Development**:
- Frontend: Vite dev server (hot reload)
- Backend: Elysia dev server (hot reload)
- Database: PostgreSQL in Docker

**Production**:
- Frontend: Built React SPA, served from static host
- Backend: Elysia compiled to binary or container
- Database: Managed PostgreSQL (e.g., AWS RDS, Vercel Postgres)
- Auth: Clerk (cloud, no deployment needed)

## Testing Strategy

**Unit Tests** (Vitest):
- Service layer business logic
- Repository query builders (in isolation)
- Schema validation

**Integration Tests** (Vitest + supertest):
- Full route → service → repository flow
- Database transactions

**E2E Tests** (Playwright):
- Critical user journeys (signup → wine purchase)
- RBAC gates
- Form validation

## Revision History
- **v1.0** (Week 6) — Initial system architecture design
- **v1.1** (Week 7-8) — Modular monolith with layered architecture
- **v1.2** (Week 9-10) — RBAC & core modules complete
- **v1.3** (Week 11-12) — Feature complete with comprehensive documentation
