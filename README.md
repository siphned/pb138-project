# WineMarket — PB138 Web Development

A full-stack multi-vendor marketplace for wine producers and retailers with event management, multi-shop ordering, and admin moderation.

**Course:** PB138 — Web Development (FI MUNI)  
**Team:** Adam Mališ, Ján Pullman, Matěj Šinogl, Ondřej Málek  
**GitHub (Primary):** https://github.com/siphned/pb138-project  
**GitLab (Mirror):** Set to public for review at https://gitlab.fi.muni.cz/

---

## What's Included

### Roles & Features
- **Winemakers:** Manage wine catalog, host events, accept B2B orders
- **Shop Owners:** Manage retail inventory, bundles, process customer orders  
- **Customers:** Browse wines, order, review, attend events (with guest checkout)
- **Admins:** Moderate content, approve role requests, view platform stats

### Tech Stack
- **Frontend:** React + TypeScript + Vite + TanStack Router + Tailwind CSS + shadcn/ui
- **Backend:** Elysia + Zod + PostgreSQL + Drizzle ORM
- **Auth:** Clerk (JWT + RBAC via public metadata)
- **Monorepo:** Turborepo + Bun package manager
- **API:** OpenAPI (auto-generated from Elysia endpoints)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions (3 parallel E2E shards)

---

## Quick Start (Local)

### Prerequisites
- Bun, Docker, Clerk account (sign up free at clerk.com)

### 1. Install & Configure
```bash
bun install

# Copy and fill environment variables:
# - Backend: apps/server/.env.local
#   Required: CLERK_SECRET_KEY, DATABASE_URL
# - Frontend: apps/web/.env.local
#   Required: VITE_CLERK_PUBLISHABLE_KEY
```

### 2. Start Database
```bash
docker compose up -d db   # Postgres on localhost:5433
```

### 3. Setup & Seed
```bash
bun run db:migrate        # Apply schema migrations
bun run db:seed           # Load demo data (20 users, 60 wines, events)
```

### 4. Run Dev Servers
```bash
bun dev
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Swagger UI: http://localhost:3000/swagger
```

---

## Key Documentation

### For Code Review
- **`docs/WORKFLOW.md`** — Git workflow, branch naming, PR process
- **`docs/CODING_STANDARDS.md`** — Linting rules, naming conventions
- **`docs/project_requirements_document.md`** — Feature requirements & scope

### For Architecture
- **`docs/ARCHITECTURE/`** — System design, module breakdown, data flow  
- **`docs/MODULES/`** — Backend service layers & responsibilities
- **`docs/ROUTES/`** — Frontend page structure & nesting
- **`docs/ROLES/`** — Role-permission matrix (auth design)

### For Deployment
- **`docs/DEMO.md`** — Feature walkthrough & credentials
- **`docs/TESTING.md`** — Test strategy & running tests
- **`docs/TECHSTACK.md`** — Technology rationale & alternatives considered

---

## Running Tests

### Unit Tests
```bash
bun run test              # All unit tests (Vitest)
bun run test:coverage     # With coverage report
```

### E2E Tests (Requires local dev servers running)
```bash
# In another terminal with `bun dev` already running:
cd apps/web
bun run test:e2e          # Full suite (3 parallel shards in CI)
bun run test:e2e --ui    # Interactive mode with Playwright Inspector
```

### Code Quality
```bash
bun run check             # Lint + format (Biome)
bun run check-types       # TypeScript validation
```

---

## Common Commands

```bash
bun dev                    # Start frontend + backend (hot reload)
bun run dev:web           # Frontend only
bun run dev:server        # Backend only

bun run generate          # Regenerate API hooks from OpenAPI spec
bun run db:generate       # Create Drizzle migration from schema changes
bun run db:migrate        # Apply pending migrations
bun run db:seed           # Populate demo data
```

---

## Project Status

✅ **All tests passing (CI green)**
- Unit tests: 508 backend + 528 frontend = 1036 total
- E2E tests: 18 user flow scenarios across 3 parallel shards
- Type checking: Full TypeScript coverage

✅ **Fully functional features**
- Multi-role authentication & authorization
- Wine catalog with search & filtering
- Event management with registration
- Multi-shop ordering & checkout
- Admin dashboard & moderation
- Light/dark theme support

---

## Notes for Reviewers

1. **GitLab Mirror:** The canonical repository is on GitHub. GitLab is temporarily set to public for access if needed.

2. **Documentation Structure:**
   - Clean, essential docs are committed (`docs/*.md`)
   - AI-generated analysis (audits, planning) is kept locally via `.gitignore` for developer reference

3. **Development Artifacts:**
   - `.claude/`, `.opencode/`, `.superpowers/` — IDE extensions & agent configs (local only)
   - `wiki/` — Quick internal reference (local only)
   - These don't affect the codebase and are excluded from submission

4. **To Get Started:** Follow "Quick Start" above. Takes ~10 minutes from zero to running dev servers.

---

**Evaluation Milestones:**
- ✅ Milestone 1 (Week 7): Design complete — ERD, API design, architecture documented
- ✅ Milestone 2 (Week 10): Core implementation — DB, API, basic FE working
- ✅ Milestone 3 (Week 13): Feature complete & polished — All requirements met, full test coverage
