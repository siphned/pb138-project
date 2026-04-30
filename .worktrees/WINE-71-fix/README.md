# WineMarket — PB138 Web Development Project

A multi-vendor wine marketplace platform with event management, multi-shop ordering, and admin moderation workflows.

**Course:** PB138 — Úvod do vývoje webu (FI MUNI)  
**Team:** Adam Mališ, Ján Pullman, Matěj Šinogl, Ondřej Málek

---

## Overview

WineMarket connects winemakers, shop owners, and customers in a single platform:

- **Winemakers** manage production catalogs, host events, and fulfill B2B supply requests.
- **Shop Owners** manage retail inventory, bundles, and process customer orders.
- **Customers** browse, order, and review wines (with server-side guest session support).
- **Admins** moderate content, approve role requests, and view statistics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Frontend | React + Vite + TypeScript |
| Routing | TanStack Router (File-based, pathless layout tree) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Elysia + Zod (schemas & validation) |
| Auth | Clerk (JWT + RBAC via public metadata) |
| Database | PostgreSQL + Drizzle ORM |
| Code Gen | Orval (Hooks from OpenAPI spec) |
| Monorepo | Turborepo |

---

## Project Structure

```
winery/
├── apps/
│   ├── web/                    # React frontend (nested routes, Orval hooks)
│   └── server/                 # Elysia backend (modular structure, Drizzle)
├── packages/
│   ├── shared/                 # Shared Zod schemas and TypeScript types
│   ├── typescript-config/      # Base TS configurations
│   └── ui/                     # Primitive UI components
├── .github/workflows/          # CI/CD pipelines
├── docs/                       # Design docs, architecture, sequences, and audit logs
├── wiki/                       # Quick-reference patterns (React, Elysia, DB, etc.)
└── CLAUDE.md                   # Development guidelines and project patterns
```

---

## Quick Start

**Prerequisites:** [Bun](https://bun.sh), [Docker](https://www.docker.com/)

```bash
# 1. Install dependencies
bun install

# 2. Start PostgreSQL
docker compose up -d

# 3. Setup database
bun run db:migrate
bun run db:seed

# 4. Start dev servers
bun dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

---

## Common Commands

```bash
bun dev                # Start dev servers (frontend + backend)
bun run check          # Lint, format, and organize imports (Biome)
bun run check-types    # TypeScript type checking (tsc)
bun run generate       # Regenerate Orval API hooks
bun run test           # Run all unit and integration tests (Vitest)
bun run db:generate    # Create Drizzle migrations
bun run db:migrate     # Apply Drizzle migrations
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE/](docs/ARCHITECTURE/) | System design, layer diagrams, and data flow |
| [docs/API/](docs/API/) | REST API endpoint specification |
| [docs/ROLES/](docs/ROLES/) | Role-permission matrix (RBAC) |
| [docs/ROUTES/](docs/ROUTES/) | Frontend route structure and guards |
| [docs/audit/](docs/audit/) | Architecture audit and redesign logs |
| [wiki/](wiki/) | Pattern guides (React, Elysia, Drizzle, etc.) |
| [CLAUDE.md](CLAUDE.md) | Primary source of truth for coding patterns |

---

## Git Workflow

- **Branch from `dev`**: `WINE-XX-short-description`
- **Atomic Commits**: Group changes by module/logic; use conventional messages.
- **PR targets `dev`**: Requires one approval + passing CI (Biome, TSC, Vitest).
- **Release**: `main` = production-ready, merged from `dev` at milestones.
