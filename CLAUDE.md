# WineMarket — PB138 Web Development Project

A multi-vendor wine marketplace platform with event management, multi-shop ordering, and admin moderation workflows.

## Project Identity

- **Course:** PB138 — Úvod do vývoje webu (FI MUNI)
- **Team:** 4 developers (Matej lead+FE, Ondra+Johnny BE, Adam FE)
- **Phase:** Week 8 (implementation), RBAC and core modules complete
- **Tech Stack Lock:** Bun, Elysia, React + Vite, TanStack Router, PostgreSQL + Drizzle ORM, TypeScript, Orval, Tailwind + shadcn/ui, Clerk

## System Scope

Multi-actor marketplace:
- **Guests** → **Customers** (register) → **Winemakers** (manage catalog/supply) + **Shop Owners** (retail products/orders) → **Admins**
- Wine catalog, B2B supply agreements, multi-vendor orders, server-side guest sessions.
<<<<<<< HEAD

## Development Workflow (MANDATORY — established May 2026, WINE-215)

**No direct pushes to `dev`. All changes must follow this workflow:**

1. **Jira ticket** — Every task starts with a Jira ticket in the `WINE` project (created or updated by `project-manager`)
2. **Feature branch** — Work on a branch named after the Jira key: `WINE-xxx-brief-description`
3. **PR targeting `dev`** — Open a pull request from the feature branch into `dev` at the end of the task
4. **Merge via PR only** — Never push directly to `dev`; all merges happen through GitHub pull requests

### Branch naming convention
```
WINE-{ticket-number}-{short-description}
```
Examples: `WINE-61-api-test-suite`, `WINE-171-page-stubs-and-backend-audit`

### Agent responsibilities
- `project-manager` — Creates/updates Jira tickets before work begins
- Agent working on the task — Creates branch, implements, opens PR
- `reviewer` — Reviews PR before merge
=======
>>>>>>> origin/main

## Quick Start Commands

```bash
# Install dependencies
bun install

# Development
bun dev                 # Start dev server (web + server)
bun run dev:web        # Frontend only
bun run dev:server     # Backend only

# Code generation & database
bun run generate       # Regenerate Orval hooks from OpenAPI spec
bun run db:generate    # Generate migration from schema changes
bun run db:migrate     # Apply pending migrations
bun run db:seed        # Seed the database

# Code quality
bun run check          # Biome check --write (lint, format, organize imports)
bun run check-types    # TypeScript check (tsc --noEmit)

# Testing
bun run test           # Run all tests (Vitest run)
```

## Monorepo Structure

```
winery/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/routes/         # TanStack Router nested routes with guards
│   │   ├── src/hooks/          # useRoles RBAC hook
│   │   ├── src/generated/      # Orval-generated API hooks
│   │   └── src/lib/            # Axios custom instance
│   └── server/                 # Elysia backend
│       ├── src/modules/        # Feature modules (carts, orders, guest-sessions, etc.)
│       └── src/db/             # Schema, migrations, and seed
├── packages/
│   ├── shared/                 # Shared types & schemas
│   └── ui/                     # primitive components
├── docs/                       # Design docs, audit logs, and PlantUML
└── wiki/                       # AI-friendly patterns and guides
```

## Core Patterns

### RBAC (Role-Based Access Control)
- **Roles:** `customer`, `winemaker`, `shop_owner`, `admin`.
- **Clerk:** Roles live in `public_metadata.roles` array.
- **Frontend:** Use `useRoles()` hook in guards and UI logic.
- **Backend:** Use `requireRoles(["role"])` macro in routes.

### Routes & Guards
- **Structure:** Pathless layout tree (`_authenticated`, `_admin`, etc.).
- **Nesting:** Shop management nested under `/shops/$id/` (inventory, orders, bundles).
- **Public:** `/`, `/explore`, `/cart`, `/checkout` (guest-accessible).

### Cart & Orders
- **Sessions:** Server-side anonymous sessions for guests (`guest_session_id` cookie).
- **Merge:** Guest carts automatically merge into user accounts on login.
- **Freezing:** Every order creates new frozen address records.
- **Stock:** Winemaker stock is atomically allocated to retail products on creation.

### Code Quality (Biome)
- Strict rules enforced. No `any` without extreme justification.
- Organizing imports and formatting is automated via `bun run check`.
- Repository methods are typed and transactions are handled in services.

---
<<<<<<< HEAD
Last updated: May 2026
=======
Last updated: April 2026
>>>>>>> origin/main
Maintained by: Matej Šinogl

## Agent skills

### Issue tracker
Jira integrated with GitHub. Jira for tracking, GitHub for PRs. See `docs/agents/issue-tracker.md`. 

### Triage labels
Standard canonical labels used as Jira labels. See `docs/agents/triage-labels.md`. 

### Domain docs
Multi-context layout for monorepo. See `docs/agents/domain.md`. 
