# Copilot instructions — winery (siphned/pb138-project)

Purpose: provide a short, authoritative reference for AI-assisted sessions (build/test/lint commands, high-level architecture, and repo-specific conventions). Read CLAUDE.md and wiki/ before making assumptions.

---

## Essential commands (root & per-package)

Notes: this repo is a Bun + Turborepo monorepo. Use `bun` as package manager (bun@1.3.11).

- Install deps (root):
  - bun install

- Start dev servers:
  - Start all (root): bun dev  # runs `turbo run dev`
  - Frontend only: cd apps/web && bun run dev  (or bun run dev:web from root if helper script exists)
  - Backend only: cd apps/server && bun run dev  (or bun run dev:server from root if helper script exists)

- Build:
  - All (root): bun run build  # turbo run build
  - Frontend only: cd apps/web && bun run build
  - Server only: cd apps/server && bun run build

- Lint / format / typecheck:
  - Lint (root): bun run lint   # biome lint .
  - Format (root): bun run format  # biome format --write .
  - Type check (root): bun run check-types  # turbo run check-types
  - Per-package: cd into package and run the same script (e.g., cd apps/server && bun run lint)

- Tests:
  - Run all unit tests (root): bun run test  # turbo run test (Vitest)
  - Run all E2E (root): bun run test:e2e  # uses Playwright in apps/web
  - Run test in a single package:
    - cd apps/web && bun run test
  - Run *a single test* (examples):
    - By name (Vitest `-t`):
      cd apps/web && bun run test -- -t "renders button"
    - By file:
      cd apps/web && bun run test -- src/components/Button.test.tsx

- Codegen & OpenAPI / Kubb:
  - Typical flow (local):
    1. Start backend: cd apps/server && bun run dev
    2. In another shell (repo root): bun run generate
    - Generated client output: apps/web/src/generated/
  - CI uses the same flow: starts server, waits for /swagger/json, runs `bun run generate` (see .github/workflows/ci.yml)

- Database (Drizzle):
  - cd apps/server && bun run db:generate
  - cd apps/server && bun run db:migrate
  - cd apps/server && bun run db:studio
  - Seeds: cd apps/server && bun run db:seed
  - Drizzle config: apps/server/drizzle.config.ts (schema points to ./src/db/schema/index.ts)

---

## High-level architecture (short)

- Monorepo (Turborepo) with workspaces: apps/* and packages/*.
- apps/web — React + Vite frontend
  - File-based routing (TanStack Router) under apps/web/src/routes/ (use $ prefix for dynamic segments, _ for pathless, __root for root layout)
  - Uses generated API hooks (apps/web/src/generated/) produced from backend OpenAPI spec via Kubb/orval
  - Unit tests with Vitest; E2E with Playwright

- apps/server — Elysia backend
  - Organized into modules: apps/server/src/modules/* (auth, users, wines, events, orders, etc.)
  - Zod schemas drive validation and OpenAPI generation (single source of truth for API types)
  - Drizzle ORM for database schema (apps/server/src/db/schema/index.ts) and migrations
  - auth plugin (apps/server/src/modules/auth/auth.plugin.ts) injects clerkId/clerkPayload/dbUser into request context (see file for macro usage)

- packages/* — shared types and UI (packages/ui, packages/shared)

- Code generation pipeline: change Zod schemas → run backend spec export → run `bun run generate` to regenerate frontend client hooks. CI automates this and uploads generated-code as an artifact.

---

## Key repository conventions (what Copilot must follow)

- Use Bun (bun@1.3.11). Commands in CI/workflows assume Bun; prefer `bun ...` invocations.
- Lint/format with Biome (not ESLint/Prettier). Use `bun run lint` and `bun run format` from repo root or package root.
- Zod schemas are the single source of truth for API types. When modifying API shapes, ensure OpenAPI is re-generated and frontend client is re-generated.
- Do NOT write manual fetch wrappers for REST endpoints — use generated Kubb/orval client hooks (e.g., useGetProducts()). If you see hand-written fetch code, flag it.
- Backend modules are Elysia plugins; use macros like `requireAuth` and `requireRoles` (see auth.plugin.ts) and expect `dbUser` in context for authenticated handlers.
- Database: prefer soft-deletes (add `deletedAt` column) and always filter deleted rows in queries.
- Branching & PRs:
  - Branch from `dev` (not `main`) using feature/*, fix/*, docs/*
  - PR titles should include Jira key `WINE-XXX` for automation (CI reads PR title regex)
- Codegen: local generation requires a running backend; CI starts the backend and waits for `/swagger/json`. Refer to .github/workflows/ci.yml for exact steps.
- Do not add new dependencies without team approval — TECHSTACK.md locks decisions (Bun, Elysia, Drizzle, TanStack, etc.).

---

## Quick file pointers (use when searching across repo)

- apps/web/src/routes/  — file-based routing patterns (dynamic: $, pathless: _)
- apps/web/src/generated/ — generated API client (Kubb/orval)
- apps/server/src/modules/ — backend feature modules (auth, users, wines, events, etc.)
- apps/server/src/db/schema/index.ts — Drizzle schema index
- apps/server/drizzle.config.ts — Drizzle config (schema path, migrations out)
- .github/workflows/ci.yml — CI steps for install, generate, lint, typecheck, build, test (useful to reproduce CI locally)
- CLAUDE.md and wiki/ — primary repo-specific documentation and AI guidance (read before acting)

---

If a command or flow above is unclear when you run it locally, prefer the package-level script (cd into the package and run `bun run <script>`) — that always matches the package.json entry for that package.

---

Last notes for Copilot sessions:
- Read CLAUDE.md early in the session for project-specific AI rules.
- When backend API shapes change: regenerate spec → run `bun run generate` → run type-check & tests before committing.
- For automated E2E and agent-run workflows, see .github/mcp-servers.yml (Playwright config). To run E2E with a local DB, use the Docker Compose MCP server entry in that file or run `docker compose up -d` before starting tests.
- When in doubt about environment variables, check apps/web/.env.example and apps/server docs; CI uses DATABASE_URL and CLERK_JWT_KEY (see .github/workflows/ci.yml).

---

(Generated by Copilot CLI assistance)