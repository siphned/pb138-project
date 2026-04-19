# WineMarket — PB138 Web Development Project

A multi-vendor wine marketplace platform with event management, multi-shop ordering, and admin moderation workflows.

## Project Identity

- **Course:** PB138 — Úvod do vývoje webu (FI MUNI)
- **Team:** 4 developers (Matej lead+FE, Ondra+Johnny BE, Adam FE)
- **Phase:** Week 6 (implementation), Milestone 1 design docs complete
- **Repository:** GitLab (gitlab.fi.muni.cz), SSH configured, main/dev branch protection
- **Tech Stack Lock:** Bun, Elysia, React + Vite, TanStack Router, PostgreSQL + Drizzle ORM, TypeScript, Kubb, Tailwind + shadcn/ui

## System Scope

Multi-actor marketplace:
- **Guests** → **Customers** (register) → **Winemakers** (create wines/events) + **Shop Owners** (sell products) → **Admins**
- Wine catalog (singles + bundles), event management, multi-vendor orders (one cart → multiple shops), reviews, moderation workflow, winemaker invitations

**21+ entities:** Users, Winemakers, Shops, Wines, Products, Events, Carts, Orders, Availability (regular + exceptions), Reviews, Comments, Images, etc.

## Development Workflow

1. **Issue first:** Create Jira ticket (WINE-XX format)
2. **Branch:** Feature branches only (`feature/*`, `fix/*`, `docs/*`) branched from **dev** (not main)
3. **Code:** Implement feature
4. **PR:** Create MR to **dev** (all PRs require review + pipeline pass)
5. **Merge:** Squash commits, delete branch
6. **Release:** Merge dev → main when stable (main = production-ready only)

**Jira Status Flow:** To Do → Ready for Review → Done

**GitHub Automation:** PR open → Jira Ready for Review; PR merged → Jira Done; PR closed (unmerged) → Jira In Progress

## Quick Start Commands

```bash
# Install dependencies
bun install

# Development
bun dev                 # Start dev server (web + server)
bun run dev:web        # Frontend only (port 5173)
bun run dev:server     # Backend only (port 3000)

# Code generation & database
bun run generate       # Regenerate Kubb types from OpenAPI
bun run db:generate    # Generate migration from schema changes
bun run db:migrate     # Apply pending migrations
bun run db:studio      # Visual database browser

# Code quality
bun run lint           # ESLint check
bun run format         # Biome format
bun run type-check     # TypeScript check

# Testing
bun run test           # Run tests (Vitest)
bun run test:e2e       # Run E2E tests (Playwright)

# Build
bun run build          # Build both packages
bun build:web          # Frontend build (dist/)
bun build:server       # Backend build
```

## Monorepo Structure

```
winery/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/routes/         # TanStack Router file-based routing
│   │   ├── src/components/     # React components
│   │   └── src/generated/      # Kubb-generated API hooks
│   └── server/                 # Elysia backend
│       ├── src/modules/        # Feature modules (auth, users, wines, events, etc.)
│       ├── src/schema/         # Drizzle ORM table definitions
│       └── src/generated/      # OpenAPI spec (auto-generated)
├── packages/
│   ├── shared/                 # Shared types & Zod schemas
│   └── ui/                     # Reusable UI components
├── wiki/                       # Quick-reference guides (read below)
├── raw/                        # Course materials (seminars, lectures)
├── CLAUDE.md                   # This file
├── TECHSTACK.md                # Technology decisions & alternatives
└── docker-compose.yml          # Local PostgreSQL + pgAdmin

**Ownership:**
- Matej: Web app + routing architecture
- Adam: Frontend components + styling
- Ondra: Auth module + backend structure
- Johnny: Data layer (database + queries)
```

## Core Patterns

### Frontend

**File-Based Routing** (TanStack Router)
```
src/routes/
├── __root.tsx              # Root layout (navbar, footer)
├── _authenticated/         # Pathless layout (auth guard)
│   ├── route.tsx           # Auth check before loading
│   ├── products.tsx        # /products
│   └── products/$id.tsx    # /products/:id
└── login.tsx               # /login (no guard)
```
- File structure = URL structure
- `$` prefix = dynamic segment, `_` prefix = pathless, `__root` = root layout
- Use `Route.useParams()` for path params, `Route.useSearch()` for query params
- Use `createFileRoute()` to define routes

**React Patterns**
- Components = functions returning JSX, one per file
- Props = read-only configuration, children = composition
- Hooks: `useState` for local state, `useEffect` for side effects, `useMemo` for expensive computations
- `useRef` for DOM access or mutable values (no re-render)
- Custom hooks for reusable stateful logic

**Styling** (Tailwind CSS)
- Utility-first: compose styles in `className`, no separate CSS files
- Responsive: mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- Extract repetition into components (via `cn()` helper for class merging)
- `shadcn/ui`: Copy-paste component library you own (edit `src/components/ui/`)
- Dark mode via `dark:` prefix

**Data Fetching** (Kubb + React Query)
- NEVER write manual fetch code
- Backend routes (Zod schemas) → OpenAPI spec → `bun run generate` → Kubb hooks
- Use generated hooks: `useGetProducts()`, `usePostProducts()`, etc.
- React Query handles caching, background refetch, invalidation
- After mutations: `queryClient.invalidateQueries()` to refetch related data

### Backend

**Route Handlers** (Elysia)
- Simple: `app.get('/path', ({ params, query, body, set }) => { return data })`
- Validation: pass Zod schema in config → Elysia validates + types body automatically
- Status codes: `set.status = 201` for created, `set.status = 404` for not found
- Middleware: `app.onBeforeHandle()` for guards, `app.derive()` to enrich context
- Plugins: `app.use(cors())`, `app.use(openapi())` for built-in plugin support

**Modules** (Composition)
- Split routes into modules: `auth.ts`, `users.ts`, `wines.ts`, `events.ts`, `orders.ts`, `reviews.ts`, `admin.ts`, `email.ts`
- Each module: `new Elysia({ prefix: '/api/...', tags: ['...'] })`
- Compose in main app: `app.use(auth).use(users).use(wines)...`
- Benefits: clear ownership, testability, reusability

**Zod** (Single Source of Truth)
- Schema in backend + generated Kubb types for frontend
- One schema → validation + TypeScript types + OpenAPI docs
- Use `z.infer<typeof Schema>` to extract TypeScript type

**Database** (Drizzle ORM)

Tables defined in code (no separate migrations initially):
```ts
const wines = pgTable("wines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  wineId: uuid("winemaker_id").references(() => winemakers.id),
  createdAt: timestamp("created_at").defaultNow(),
})
```

- UUIDs for IDs (distributed, not guessable)
- Foreign keys enforce referential integrity
- Query API: `db.query.wines.findMany({ where, with: { winemaker: true } })`
- Mutations: insert/update/delete return changed rows
- Joins: explicit `.innerJoin()`, or use `with: {...}` for auto-joins
- Transactions: `db.transaction()` for all-or-nothing operations
- Soft delete: add `deletedAt` column, always filter in queries

## Wiki — Quick Reference Guide

The `wiki/` folder is your AI-friendly cheatsheet. Use it during development:

- **[wiki/README.md](wiki/README.md)** — Navigation index
- **[wiki/REACT.md](wiki/REACT.md)** — Components, props, hooks, state, custom hooks
- **[wiki/STYLING.md](wiki/STYLING.md)** — Tailwind utilities, flexbox, grid, responsiveness, shadcn/ui
- **[wiki/ROUTING.md](wiki/ROUTING.md)** — File-based routing, params, search, layouts, loaders, guards
- **[wiki/REST_API.md](wiki/REST_API.md)** — HTTP methods, status codes, REST principles, Richardson model
- **[wiki/ELYSIA.md](wiki/ELYSIA.md)** — Route handlers, validation, middleware, plugins, lifecycle hooks
- **[wiki/KUBB.md](wiki/KUBB.md)** — Code generation from OpenAPI, typed clients, React hooks, workflows
- **[wiki/DATABASE.md](wiki/DATABASE.md)** — ERD, relationships, Drizzle queries, migrations, transactions
- **[wiki/AI_DEV.md](wiki/AI_DEV.md)** — Tokens, context windows, hallucinations, agentic coding, MCP, skills

**How to Use:**
1. During implementation, check the relevant wiki page for patterns and examples
2. When Claude suggests code, verify it matches patterns in the wiki
3. If implementing something new, reference the wiki page in your notes/PR
4. Avoid context bloat: wiki is organized for quick lookup, read only what you need

## Known Patterns & Gotchas

### Frontend

- **Always use `Route.useNavigate()` for programmatic navigation**, not manual history manipulation
- **Search params are the source of truth** — `/courses?semester=spring` survives refresh, is shareable
- **Components are your abstraction**, not CSS classes — extract repeated Tailwind strings into components
- **Never create objects/arrays in props** — define outside, pass reference (prevents unnecessary re-renders)
- **Rules of hooks:** Only call hooks at top level, never in conditionals, loops, or callbacks
- **Custom hooks start with `use`** and must be pure (same input → same output)

### Backend

- **One Zod schema = types + validation + OpenAPI** — don't duplicate definitions across interfaces, schemas, routes
- **Always set correct status codes** — they're part of your API contract (200, 201, 400, 401, 404, etc.)
- **Soft delete by default** — add `deletedAt` column, always filter in queries to avoid exposing deleted data
- **Use serializable transactions for read-then-write** — prevents race conditions in concurrent operations
- **Repository receives `db` or `tx` as parameter** — services own transaction logic, repositories are stateless
- **Validate at system boundaries** (user input, external APIs) — trust internal code

### Shared

- **TypeScript is your safety net** — use strict mode, don't use `any`
- **Branch from `dev`, not `main`** — main is production-only, merge dev → main for releases
- **Don't add dependencies without approval** — check TECHSTACK.md for locked choices
- **Keep CLAUDE.md lean** — bloated docs reduce AI effectiveness; only strict, enforceable rules

## Technology Decisions (Locked)

See `TECHSTACK.md` for detailed rationale. **No changes without team discussion:**

- **Runtime:** Bun (faster, native TypeScript, built-in test/format tools)
- **Frontend:** React + Vite (not Next.js, Next is overkill for SPA)
- **Routing:** TanStack Router (not React Router, better DX + type safety)
- **Backend:** Elysia (not Express, better Bun integration + Zod sync)
- **ORM:** Drizzle (not Prisma, query builder with optional ORM, better control)
- **Database:** PostgreSQL (not SQLite, production-grade)
- **Styling:** Tailwind CSS (utility-first, zero runtime)
- **UI Library:** shadcn/ui (copy-paste ownership, not Material-UI)
- **Code Gen:** Kubb + OpenAPI (not GraphQL, simpler than tRPC)

## Environment Setup

**.env (create locally, don't commit):**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/winemarket
```

**Local development:**
```bash
docker compose up -d    # Start PostgreSQL container
bun install             # Install dependencies
bun run db:migrate      # Apply migrations
bun dev                 # Start both servers
```

## Useful Resources

- **Jira:** Issues, epics, sprints — source of truth for tasks
- **GitLab:** Code, PRs, CI pipeline — branch protection on main/dev
- **Course Materials:** `raw/` folder contains seminars and lectures
- **Figma:** Design mockups (Adam maintaining)
- **PlantUML Diagrams:** `docs/` folder — architecture, sequences, relationships

## CI/CD Pipeline

GitLab CI runs on every commit:
1. `bun install` — install dependencies
2. `bun run lint` — check code quality
3. `bun run type-check` — TypeScript validation
4. `bun run build` — compile both apps

Push fails if any step fails. Fix locally, push again.

## Team Communication

- **Issues:** Jira (technical details, requirements, tracking)
- **PR Reviews:** GitLab (code changes, feedback loops)
- **Synchronous:** Weekly standup + sprint review (Scrum cadence)
- **Async:** PR comments, Jira comments for decisions

## Code Review Checklist

Before creating a PR:
- [ ] Code matches patterns in this CLAUDE.md
- [ ] Tests pass locally (`bun run test`)
- [ ] No new console errors/warnings
- [ ] Types are correct (no `any` unless unavoidable)
- [ ] Commit message is conventional (`feat: ...`, `fix: ...`, `docs: ...`)
- [ ] PR targets `dev` (not main)
- [ ] PR has comprehensive description

## What NOT to Do

- ❌ Don't add dependencies without approval (Bun install, npm install)
- ❌ Don't hardcode URLs — use route names and navigate functions
- ❌ Don't write manual fetch code — regenerate with Kubb
- ❌ Don't commit `.env` files with secrets
- ❌ Don't soft-delete without adding `deletedAt` column
- ❌ Don't disable TypeScript strict mode
- ❌ Don't merge to main — main is protected, only dev merges to main
- ❌ Don't ignore CI failures — fix locally and re-push

## AI Development Tips

1. **Read CLAUDE.md first** — it's injected into Claude's system prompt
2. **Use the wiki** — paste `wiki/REACT.md`, `wiki/ELYSIA.md`, etc. when getting stuck
3. **Specify files, not vague descriptions** — "add button to `src/routes/products/$id.tsx`" beats "make it look better"
4. **Agentic coding:** You define spec, Claude implements across files, you review diffs
5. **Keep context lean** — bloated context = worse results; curate what Claude sees
6. **Verify hallucinations** — check dependencies exist, routes are named correctly
7. **Use MCP servers** — Context7 for live library docs, Playwright for testing

---

Last updated: April 2026
Maintained by: Matej Šinogl
