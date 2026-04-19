# WineMarket — PB138 Web Development Project

A multi-vendor wine marketplace platform with event management, multi-shop ordering, and admin moderation workflows.

**Course:** PB138 — Úvod do vývoje webu (FI MUNI)  
**Team:** Adam Mališ, Ján Pullman, Matěj Šinogl, Ondřej Málek

---

## Overview

WineMarket is a multi-vendor wine marketplace connecting winemakers, shop owners, and customers:

- **Winemakers** create wines, host tasting events, invite collaborators
- **Shop Owners** manage inventory, create wine bundles, process orders
- **Customers** browse wines, place multi-vendor orders, attend events, write reviews
- **Admins** moderate content, approve accounts & events, manage platform

---

## Tech Stack

**Core Technologies** (locked in TECHSTACK.md):

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Bun | Fast JavaScript runtime, native TypeScript, built-in test/lint tools |
| **Frontend Framework** | React 19 + TypeScript + Vite | UI components, type safety, fast builds |
| **Routing** | TanStack Router | File-based routing (Phase 2: fully integrated) |
| **State & Data** | TanStack Query + Kubb | Server state management & auto-generated API hooks |
| **Backend API** | Elysia + Zod | Type-safe HTTP routes, schema validation |
| **API Spec** | OpenAPI + Scalar | Auto-generated from Elysia routes, interactive docs |
| **Code Generation** | Kubb | Generate React hooks from OpenAPI spec → frontend type safety |
| **Database** | PostgreSQL + Drizzle ORM | Relational DB, type-safe query builder |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS, reusable component library (Phase 2) |
| **Monorepo** | Turborepo + Bun | Multi-package coordination, fast builds |
| **Validation** | Zod | Schema validation + TypeScript type inference (shared FE/BE) |
| **Testing** | Vitest + Playwright | Unit tests + E2E tests (Phase 2: expanded coverage) |
| **CI/CD** | GitLab CI | Lint, type-check, build, test on every MR |
| **Project Mgmt** | Jira + GitLab | Issue tracking, Git workflow automation |

**Phase 1 (Weeks 6-7):** Design docs ✅  
**Phase 2 (Weeks 8-10):** Core implementation (database, API, basic frontend)  
**Phase 3 (Weeks 11-13):** Feature completion, testing, polish

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
├── docs/                       # Design docs, architecture, API specs
│   ├── ARCHITECTURE/           # System design & layer diagram
│   ├── API/                    # REST API endpoint specification
│   ├── ROLES/                  # Role-permission matrix
│   ├── MODULES/                # Backend module breakdown
│   ├── ROUTES/                 # Frontend route structure
│   ├── TECHSTACK/              # Technology decisions & rationale
│   ├── wiki/                   # Quick-reference guides (comprehensive)
│   ├── raw/                    # Course materials (seminars, lectures)
│   ├── code_reviews/           # Code review assessments
│   └── project_requirements_document.md
├── CLAUDE.md                   # Development guidelines
└── TECHSTACK.md                # Technology stack decisions
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

**Development:**
```bash
bun install            # Install all dependencies
bun dev                # Start both dev servers (frontend + backend)
bun run dev:web        # Frontend only (port 5173)
bun run dev:server     # Backend only (port 3000)
```

**Code Quality:**
```bash
bun run lint           # ESLint check (Biome)
bun run format         # Auto-format code (Biome)
bun run type-check     # TypeScript type checking
```

**Database (Phase 2):**
```bash
bun run db:generate    # Generate migration from schema changes
bun run db:migrate     # Apply pending migrations
bun run db:studio      # Visual database browser (Drizzle Studio)
```

**Code Generation:**
```bash
bun run generate       # Regenerate Kubb types from OpenAPI spec
```

**Testing:**
```bash
bun run test           # Run unit tests (Vitest)
bun run test:e2e       # Run E2E tests (Playwright)
```

**Building:**
```bash
bun run build          # Build both packages for production
bun build:web          # Frontend build → dist/
bun build:server       # Backend build
```

---

## Documentation

### Design & Architecture
| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE/](docs/ARCHITECTURE/) | System design, layer diagram, architecture decisions |
| [docs/API/](docs/API/) | REST API endpoint specification (50+ endpoints) |
| [docs/ROLES/](docs/ROLES/) | Role-permission matrix (5 roles × 50+ features) |
| [docs/MODULES/](docs/MODULES/) | Backend module breakdown & ownership |
| [docs/ROUTES/](docs/ROUTES/) | Frontend route structure & page hierarchy |
| [docs/TECHSTACK/](docs/TECHSTACK/) | Technology decisions & rationale |
| [docs/project_requirements_document.md](docs/project_requirements_document.md) | Complete PRD (functional & non-functional requirements) |

### Quick Reference (Wiki)
| Guide | Purpose |
|-------|---------|
| [docs/wiki/README.md](docs/wiki/README.md) | Wiki index & how to use |
| [docs/wiki/REACT.md](docs/wiki/REACT.md) | React patterns, hooks, components, state |
| [docs/wiki/ROUTING.md](docs/wiki/ROUTING.md) | TanStack Router file-based routing |
| [docs/wiki/REST_API.md](docs/wiki/REST_API.md) | REST fundamentals & HTTP best practices |
| [docs/wiki/ELYSIA.md](docs/wiki/ELYSIA.md) | Elysia framework, routes, middleware |
| [docs/wiki/KUBB.md](docs/wiki/KUBB.md) | Kubb code generation from OpenAPI |
| [docs/wiki/DATABASE.md](docs/wiki/DATABASE.md) | Drizzle ORM, ERD, migrations, transactions |
| [docs/wiki/STYLING.md](docs/wiki/STYLING.md) | Tailwind CSS, shadcn/ui, responsive design |
| [docs/wiki/AI_DEV.md](docs/wiki/AI_DEV.md) | AI-assisted development, context, tokens |

### Course Materials
| Resource | Location |
|----------|----------|
| Seminar slides & materials | [docs/raw/sem_slides_group_03/](docs/raw/sem_slides_group_03/) |
| Course lectures | [docs/raw/lec/](docs/raw/lec/) |
| Code review assessments | [docs/code_reviews/](docs/code_reviews/) |

### Project Guidelines
| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Development guidelines, architecture patterns, team workflow |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | Git workflow, Jira integration, branch naming, PR process |
| [TECHSTACK.md](TECHSTACK.md) | Technology stack locked decisions |

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

