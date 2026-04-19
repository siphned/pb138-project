# WineMarket — PB138 Web Development Project

A multi-vendor wine marketplace platform with event management, multi-shop ordering, and admin moderation workflows.

**Course:** PB138 — Úvod do vývoje webu (FI MUNI)  
**Team:** Matěj Šinogl, Ondřej, Johnny, Adam

---

## Overview

WineMarket connects winemakers, shop owners, and customers in a single platform:

- **Winemakers** manage wines, host events, and invite collaborators
- **Shop Owners** manage inventory and process orders
- **Customers** browse, order, and review wines
- **Admins** moderate content and approve accounts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Frontend | React + Vite + TypeScript |
| Routing | TanStack Router |
| Backend | Elysia |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| Styling | Tailwind CSS + shadcn/ui |
| API Client | Kubb (generated from OpenAPI) |
| Monorepo | Turborepo |

---

## Project Structure

```
winery/
├── apps/
│   ├── web/          # React frontend (port 5173)
│   └── server/       # Elysia backend (port 3000)
├── packages/
│   ├── shared/       # Shared Zod schemas & types
│   └── ui/           # Reusable UI components
├── docs/             # Architecture, API spec, diagrams
├── wiki/             # Quick-reference guides
└── docker-compose.yml
```

---

## Quick Start

**Prerequisites:** [Bun](https://bun.sh), [Docker](https://docker.com)

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies
bun install

# 3. Apply migrations
bun run db:migrate

# 4. Start dev servers (frontend + backend)
bun dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000  
pgAdmin: http://localhost:5050

---

## Common Commands

```bash
bun dev                # Start all dev servers
bun run dev:web        # Frontend only
bun run dev:server     # Backend only

bun run db:generate    # Generate migration from schema changes
bun run db:migrate     # Apply pending migrations
bun run db:studio      # Visual database browser

bun run generate       # Regenerate Kubb API client from OpenAPI spec

bun run lint           # ESLint
bun run format         # Biome format
bun run type-check     # TypeScript check
bun run test           # Vitest unit tests
bun run test:e2e       # Playwright E2E tests
bun run build          # Build all packages
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE/](docs/ARCHITECTURE/) | System design & layer diagram |
| [docs/API/](docs/API/) | REST API endpoint specification |
| [docs/ROLES/](docs/ROLES/) | Role-permission matrix |
| [docs/MODULES/](docs/MODULES/) | Backend module breakdown |
| [docs/ROUTES/](docs/ROUTES/) | Frontend route structure |
| [wiki/](wiki/) | Quick-reference guides (React, Elysia, Drizzle, etc.) |
| [CLAUDE.md](CLAUDE.md) | AI development guide & project conventions |

---

## Environment

Create a `.env` file in the root (do not commit):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/winemarket
```

---

## Git Workflow

- Branch from `dev`: `WINE-XX-short-description`
- PR targets `dev`, requires one approval + passing CI
- Squash merge, delete branch after merge
- `main` = production only, merged from `dev` at milestones

