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

*Currently installed & configured:*

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Frontend | React + Vite + TypeScript |
| Backend | Elysia + Zod (schemas & validation) |
| Code Generation | Kubb (from OpenAPI spec) |
| Monorepo | Turborepo |

*Installed but not yet integrated:*
- PostgreSQL + Drizzle ORM (dependencies present, database wiring coming Phase 2)

*Coming soon (Phase 2):*
- TanStack Router (frontend routing)
- Tailwind CSS + shadcn/ui (styling)

---

## Project Structure

```
winery/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   └── server/                 # Elysia backend
├── packages/
│   ├── typescript-config/      # Shared tsconfig
│   └── ui/                     # Reusable UI components (stub)
├── .github/workflows/          # CI/CD pipelines
├── docs/                       # Design docs & diagrams
├── wiki/                       # Quick-reference guides
└── CLAUDE.md                   # Development guidelines
```

---

## Quick Start

**Prerequisites:** [Bun](https://bun.sh)

```bash
# 1. Install dependencies
bun install

# 2. Start dev servers (frontend + backend)
bun dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

**Current Status:** Frontend + Elysia backend running. Database schema exists but not connected to backend yet (Phase 2).

---

## Common Commands

```bash
bun dev                # Start all dev servers (frontend + backend)
bun build              # Build all packages for production

bun lint               # Code quality check (Biome)
bun format             # Auto-format code (Biome)
bun check-types        # TypeScript type checking

bun test               # Run unit tests (Vitest)
bun test:e2e           # Run E2E tests (Playwright)
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

**Frontend:** See `apps/web/.env.example` for configuration. Copy to `apps/web/.env.local` for local development.

**Backend:** Environment wiring (database connection strings, etc.) coming in Phase 2 when database is integrated.

---

## Git Workflow

- Branch from `dev`: `WINE-XX-short-description`
- PR targets `dev`, requires one approval + passing CI
- Squash merge, delete branch after merge
- `main` = production only, merged from `dev` at milestones

