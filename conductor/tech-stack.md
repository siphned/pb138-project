# Winery Tech Stack

## Package Management
This project exclusively uses **Bun** for package management and script execution. Do not use `npm`, `yarn`, or `pnpm`.

## Frontend
- React (TypeScript)
- Vite
- TanStack Query
- TanStack Router
- Shadcn UI
- Vanilla CSS / Tailwind (as requested)

## Backend
- Node.js (Elysia)
- Bun (as runtime)
- Drizzle ORM (PostgreSQL)
- Clerk (Auth & Webhooks via Svix)

## Tooling
- Kubb (API Generation)
- Biome (Linting/Formatting)
- Vitest (Unit/Integration, Benchmarking)
- React Testing Library (Frontend Components)
- Playwright (e2e Testing)
- GitHub Actions (Coverage Enforcement & CI/CD)

## Infrastructure
- Vercel (Frontend Hosting)
- Render (Backend Hosting)
- Neon (Postgres Database)
- GitHub Actions (CI/CD)
