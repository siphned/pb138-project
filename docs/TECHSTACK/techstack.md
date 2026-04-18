# Technology Stack — WineMarket

## Overview
**Final, locked technology stack** for the WineMarket platform. No changes after Week 6.

---

## Backend Stack

### Runtime & Framework
- **Bun** — JavaScript runtime (fast, lightweight)
- **Elysia** — Lightweight TypeScript web framework
- **TypeScript** — Type-safe JavaScript

### Database & ORM
- **PostgreSQL** — Relational database
- **Drizzle ORM** — Type-safe SQL query builder
- **Drizzle Migrations** — Schema version control

### Validation & Types
- **Zod** — TypeScript-first validation library
  - Single source of truth for types + validation + OpenAPI
  - Used in both backend (routes) and frontend (forms)

### API & Documentation
- **OpenAPI 3.0** — Auto-generated from Elysia routes + Zod schemas
- **Scalar** — OpenAPI explorer (replaces Swagger UI)

### Authentication & Security
- **JWT** — Token-based authentication
- **Sessions table** — Refresh token tracking
- **Bcrypt** — Password hashing

### Email
- **Resend** or **Nodemailer** — Transactional email service

### File Storage
- **AWS S3** — Image and file storage

### Testing
- **Vitest** — Unit testing framework
- **Playwright** — End-to-end testing

---

## Frontend Stack

### Runtime & Build
- **Bun** — Package manager, runtime
- **Vite** — Lightning-fast build tool
- **TypeScript** — Type-safe development

### Framework & Rendering
- **React 19** — UI library
- **TypeScript** — Type safety throughout

### Routing
- **TanStack Router** — File-based routing (similar to Next.js)
  - Automatic route code splitting
  - Type-safe route params

### State Management
- **TanStack Query (React Query)** — Server state management
  - Automatic caching and synchronization
  - Request deduplication
  - Automatic refetching

### Forms & Validation
- **React Hook Form** — Form state management
- **Zod** — Schema validation (same schemas as backend!)

### Styling
- **Tailwind CSS** — Utility-first CSS framework
- **CSS Modules** — Component-scoped styles (optional)

### UI Components
- **shadcn/ui** — Unstyled, accessible components
  - Built on Radix UI primitives
  - Customizable with Tailwind
  - Copy-paste component library

### API Client Generation
- **Kubb** — OpenAPI client generator
  - Auto-generates TypeScript hooks from OpenAPI spec
  - Type-safe API calls
  - Integrates with TanStack Query

### Theming
- **Tailwind CSS Dark Mode** — Built-in dark mode support
  - Light/dark theme toggle
  - Stores preference in localStorage

### Testing
- **Playwright** — End-to-end testing

---

## Monorepo & Tooling

### Monorepo
- **Turborepo** — Monorepo build system
  - Incremental builds and caching
  - Parallel task execution

### Workspaces
- `apps/web` — Frontend application
- `apps/server` — Backend application
- `packages/types` — Shared TypeScript types
- `packages/api` — Generated API hooks (@repo/api)
- `packages/ui` — Shared UI components (@repo/ui)
- `packages/config` — Shared config (tsconfig, eslint) (@repo/config)

### Package Manager
- **Bun** — Fast JavaScript package manager
  - Lockfile: `bun.lockb`
  - Install: `bun install`

### Code Quality
- **ESLint** — Linting
- **Prettier** — Code formatting
- **Pre-commit hooks** — Run linters before commit

### Version Control & CI/CD
- **Git** — Version control
- **GitLab** — Repository hosting (gitlab.fi.muni.cz)
- **GitLab CI** — CI/CD pipelines
  - Auto-run ESLint, Prettier, tests on each push
  - Merge only after pipeline passes

### Project Management
- **Jira** — Issue tracking and sprint planning
- **Figma** — Design and wireframes

---

## Development Environment Setup

### Required Tools
- **Bun 1.0+** — `curl -fsSL https://bun.sh/install | bash`
- **Node.js 18+** — (optional, if not using Bun)
- **PostgreSQL 14+** — Local or Docker
- **VS Code** — Recommended editor with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - PlantUML
  - Thunder Client (API testing, optional)

### Local Development
```bash
# Install dependencies
bun install

# Start development servers
bun dev          # Both frontend + backend (watch mode)
bun run web:dev  # Frontend only
bun run server:dev # Backend only

# Run linters
bun run lint

# Format code
bun run format

# Run tests
bun test         # All tests
bun test:watch   # Watch mode
```

### Environment Variables
- `.env` — Local environment variables (not committed)
- `.env.example` — Template for environment variables

---

## Architecture Notes

### Why This Stack?

| Tech | Reason |
|------|--------|
| **Bun** | Fast, integrated tooling, modern JavaScript runtime |
| **Elysia** | Lightweight, built-in OpenAPI, perfect for microservices |
| **PostgreSQL** | Robust, relational, ACID transactions |
| **Drizzle** | Type-safe, lightweight, perfect for Bun |
| **Zod** | Single source of truth for types (FE + BE) |
| **React** | Mature, component-based, excellent ecosystem |
| **TanStack Query** | Best-in-class server state management |
| **Tailwind** | Utility-first, dark mode support, rapid development |
| **shadcn/ui** | Composable, customizable, modern |
| **Kubb** | Eliminate REST API client boilerplate |
| **Turborepo** | Monorepo organization, fast builds |

### Critical Pipeline

```
Database Schema (Drizzle)
    ↓
Zod Schemas (validation + types)
    ↓
Elysia Routes (HTTP endpoints)
    ↓
OpenAPI Spec (auto-generated)
    ↓
Kubb Code Generation
    ↓
React Hooks (@repo/api)
    ↓
Frontend Components (type-safe, validated)
```

This ensures:
- No frontend/backend type mismatches
- API always documented and current
- Single source of truth for types
- Automatic client generation

---

## Security Considerations

- **HTTPS only** in production
- **Passwords hashed** with bcrypt (min 12 rounds)
- **JWT tokens** with short expiry (1 hour access, 7 day refresh)
- **Input validation** via Zod (both frontend and backend)
- **CORS** properly configured
- **SQL injection prevention** via Drizzle ORM
- **XSS prevention** via React's built-in escaping
- **Secrets** stored in environment variables (never committed)

---

## Performance Optimizations

- **Bun** — Native TypeScript, no transpilation overhead
- **Vite** — ES modules, faster hot reload
- **TanStack Query** — Smart caching, request deduplication
- **Code splitting** — Automatic via Vite + React
- **Image optimization** — via AWS S3 + CDN (future)
- **Database indexes** — On foreign keys and frequently filtered columns

---

## Scaling Considerations

**MVP (Weeks 8-13):**
- Single server instance
- PostgreSQL on same machine or RDS
- S3 for static assets

**Phase 2 (Future):**
- Load balancing with multiple Bun instances
- Redis for caching
- AWS CloudFront for CDN
- Read replicas for database
- Microservices (if needed)

---

## Deployment

### Staging
- **Server**: Linux container (Docker)
- **Database**: PostgreSQL RDS
- **Static Files**: AWS S3 + CloudFront

### Production
- Replicate staging setup
- Health checks and monitoring
- Automated backups
- Log aggregation (CloudWatch or ELK)

---

## Locking Policy

**This stack is LOCKED as of Week 6.**

No tech changes without:
1. Team consensus (all 4 members agree)
2. TA approval
3. Risk assessment (breaking changes?)

Examples of locked-in decisions:
- ✅ Using Bun (not Node.js)
- ✅ Using PostgreSQL (not MongoDB)
- ✅ Using Zod (not another type validator)
- ✅ Using Elysia (not Express/Nest)
- ✅ Using TanStack Router (not Next.js)

---

## Reference Links

- Bun: https://bun.sh
- Elysia: https://elysiajs.com
- Drizzle: https://orm.drizzle.team
- Zod: https://zod.dev
- TanStack Query: https://tanstack.com/query
- TanStack Router: https://tanstack.com/router
- Tailwind: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Kubb: https://kubb.dev
- Turborepo: https://turbo.build

---

## Revision History
- **v1.0** (Week 6) — Final, locked technology stack defined
