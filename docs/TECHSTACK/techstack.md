# Technology Stack — WineMarket

## Backend Stack

### Runtime & Framework
- **Bun** - JavaScript runtime (faster than Node.js)
- **Elysia** - Type-safe web framework (Bun-optimized)

### Database
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe ORM for Postgres

### Validation & Types
- **Zod** - Schema validation + TypeScript types
- **OpenAPI** - Auto-generated API documentation

### Authentication
- **JWT** - Token-based authentication
- **Lucia** or custom session management

### Email
- **Resend** or **Nodemailer** - Transactional emails

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing

---

## Frontend Stack

### Runtime & Build
- **Bun** - Package manager and runtime
- **Vite** - Lightning-fast build tool
- **React 19** - UI framework

### Routing & State
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form state management

### Validation
- **Zod** - Schema validation (shared with backend)

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Unstyled, composable components
- **Dark mode** - Built-in via Tailwind

### API Integration
- **Kubb** - Generate React hooks from OpenAPI

### Testing
- **Playwright** - E2E testing

---

## Monorepo & Infrastructure

### Package Management
- **Turborepo** - Monorepo task orchestration
- **Bun** - Package manager (faster than npm/yarn)

### Workspaces
- `apps/server` - Backend (Elysia + PostgreSQL)
- `apps/web` - Frontend (React + Vite)
- `packages/@repo/types` - Shared types
- `packages/@repo/api` - Generated API hooks
- `packages/@repo/config` - Shared config (eslint, prettier)

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks (pre-commit)

### CI/CD
- **GitLab CI** - Continuous integration
- **GitLab Registry** - Container registry

### Project Management
- **Jira** - Agile sprint tracking
- **GitLab** - Source control (protected main/dev)

### Design & Prototyping
- **Figma** - UI mockups and design system

---

## Why This Stack?

| Tool | Why |
|------|-----|
| **Bun** | Fast runtime, great DX, built-in bundler |
| **Elysia** | Type-safe, OpenAPI-first, Bun-optimized |
| **Drizzle** | Lightweight, SQL-first, excellent for monolith |
| **Zod** | Single source of truth (FE+BE validation) |
| **React** | Mature, component-based, excellent ecosystem |
| **TanStack Router** | File-based (like Next.js), full control |
| **TanStack Query** | Industry standard for server state |
| **Tailwind** | Rapid development, dark mode support |
| **Kubb** | Auto-generate types from API → no FE/BE mismatch |
| **Turborepo** | Monorepo efficiency, cacheable builds |

---

## Development Workflow

```
Code → Git commit → Push to feature/* branch
  ↓
GitLab MR (code review) → CI pipeline (lint, test, build)
  ↓
Approval → Merge to dev → Auto-deploy staging
  ↓
Manual merge to main (releases) → Auto-deploy production
```

---

## Key Infrastructure Decisions

### Why Monorepo?
- Shared types between FE and BE
- Easy to keep API and client in sync
- Single CI/CD pipeline

### Why Drizzle over Prisma?
- More control (SQL-first, not model-first)
- Better for complex queries
- Lighter footprint

### Why Kubb for API client?
- Auto-generate from OpenAPI
- No manual sync between API and client
- Type-safe, fully typed responses

### Why TanStack Query?
- Industry standard for async server state
- Advanced caching and invalidation
- Great DevTools

---

## Deployment Architecture

```
Development (localhost)
    ↓
Staging (auto-deploy from dev)
    ↓
Production (manual-deploy from main)
```

All environments use:
- Same Docker image
- Same environment variables setup
- Identical configurations

---

## Performance Targets

- **Backend**: < 100ms API response time
- **Frontend**: Lighthouse score > 90
- **Bundle size**: < 200KB gzipped (no code splitting)
- **Database**: < 10ms query time (indexed)

---

## Security Standards

- **HTTPS only** (TLS 1.3+)
- **CORS** properly configured
- **SQL injection** prevention (Drizzle parameterized)
- **XSS** prevention (React auto-escaping)
- **CSRF** tokens on state-changing requests
- **Password** hashing (bcrypt or Argon2)
- **JWT** with short expiry + refresh tokens

---

## Monitoring & Logging

- **API logs**: Request/response timestamps, latencies
- **Database logs**: Slow query logs
- **Frontend errors**: Error tracking (optional)
- **Performance**: Bundle size tracking

---

## Revision History
- **v1.0** (Week 6) — Technology stack locked and documented
