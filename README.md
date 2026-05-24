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

<<<<<<< HEAD
**Prerequisites:** [Bun](https://bun.sh), [Docker](https://www.docker.com/), [Clerk account](https://clerk.com/) for authentication
=======
**Prerequisites:** [Bun](https://bun.sh), [Docker](https://www.docker.com/)
>>>>>>> origin/main

### Step 1: Install Dependencies
```bash
bun install
```

<<<<<<< HEAD
### Step 2: Configure Environment

Copy `.env.example` files and fill in required values:
```bash
# Backend
cd apps/server
cp .env.example .env.local
# Add: CLERK_SECRET_KEY, DATABASE_URL, RESEND_API_KEY

# Frontend
cd apps/web
cp .env.example .env.local
# Add: VITE_CLERK_PUBLISHABLE_KEY
```

### Step 3: Start PostgreSQL
```bash
docker compose up -d
```

Verify: `docker ps` should show `winery_postgres`

### Step 4: Setup Database
```bash
# Create tables and migrations
bun run db:generate
bun run db:migrate

# Seed with demo data
bun run db:seed
```

### Step 5: Start Development Servers
```bash
# From project root, starts both frontend and backend
=======
# 2. Start PostgreSQL
docker compose up -d

# 3. Setup database
bun run db:migrate
bun run db:seed

# 4. Start dev servers
>>>>>>> origin/main
bun dev
```

Or run separately:
```bash
# Terminal 1: Frontend (React + Vite)
bun run dev:web
# Visit http://localhost:5173

<<<<<<< HEAD
# Terminal 2: Backend (Elysia + PostgreSQL)
bun run dev:server
# API at http://localhost:3000
# Swagger docs at http://localhost:3000/swagger
```

=======
>>>>>>> origin/main
---

## Common Commands

### Development
```bash
<<<<<<< HEAD
bun dev                 # Start both frontend + backend (hot reload)
bun run dev:web        # Frontend only (Vite)
bun run dev:server     # Backend only (Elysia)
```

### Code Quality
```bash
bun run check          # Lint, format, organize imports (Biome) - FIXES IN PLACE
bun run check-types    # TypeScript type checking (no fixes)
```

### Code Generation & Database
```bash
bun run generate       # Regenerate Orval API hooks from OpenAPI spec
bun run db:generate    # Create new Drizzle migration from schema changes
bun run db:migrate     # Apply pending migrations to PostgreSQL
bun run db:seed        # Populate database with demo data
```

### Testing
```bash
bun run test           # Run all unit tests (Vitest)
bun run test:watch     # Watch mode for tests
bun run test:coverage  # Generate coverage report
```

### Deployment (CI/CD)
```bash
bun run build:web      # Build production React bundle
bun run build:server   # Build production server binary
=======
bun dev                # Start dev servers (frontend + backend)
bun run check          # Lint, format, and organize imports (Biome)
bun run check-types    # TypeScript type checking (tsc)
bun run generate       # Regenerate Orval API hooks
bun run test           # Run all unit and integration tests (Vitest)
bun run db:generate    # Create Drizzle migrations
bun run db:migrate     # Apply Drizzle migrations
>>>>>>> origin/main
```

---

## Documentation & Demos

### For Evaluators
- **[docs/DEMO.md](docs/DEMO.md)** — 10-15 min step-by-step walkthrough of all features
  - Guest checkout flow, role requests, admin moderation
  - API & Swagger verification
  - Troubleshooting tips

### For Developers
| Document | Description |
|----------|-------------|
<<<<<<< HEAD
| [docs/ARCHITECTURE/architecture.md](docs/ARCHITECTURE/architecture.md) | System design, 3-layer backend, data flow, modules |
| [docs/API/api.md](docs/API/api.md) | Complete REST API endpoint specification with examples |
| [docs/ROLES/roles.md](docs/ROLES/roles.md) | Role-permission matrix (RBAC) |
| [docs/ROUTES/](docs/ROUTES/) | Frontend route structure and guards |
| [wiki/](wiki/) | Pattern guides (React, Elysia, Drizzle, Styling) |
| [CLAUDE.md](CLAUDE.md) | Primary development guide (patterns, rules, workflow)
| [CLAUDE.local.md](CLAUDE.local.md) | Frontend-specific rules (for Adam)

### For Reference
- [docs/audit/](docs/audit/) — Architecture audits, redesign decisions
- [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) — Code quality & conventions |
=======
| [docs/ARCHITECTURE/](docs/ARCHITECTURE/) | System design, layer diagrams, and data flow |
| [docs/API/](docs/API/) | REST API endpoint specification |
| [docs/ROLES/](docs/ROLES/) | Role-permission matrix (RBAC) |
| [docs/ROUTES/](docs/ROUTES/) | Frontend route structure and guards |
| [docs/audit/](docs/audit/) | Architecture audit and redesign logs |
| [wiki/](wiki/) | Pattern guides (React, Elysia, Drizzle, etc.) |
| [CLAUDE.md](CLAUDE.md) | Primary source of truth for coding patterns |
>>>>>>> origin/main

---

## Git Workflow

- **Branch from `dev`**: `WINE-XX-short-description`
- **Atomic Commits**: Group changes by module/logic; use conventional messages.
- **PR targets `dev`**: Requires one approval + passing CI (Biome, TSC, Vitest).
- **Release**: `main` = production-ready, merged from `dev` at milestones.
