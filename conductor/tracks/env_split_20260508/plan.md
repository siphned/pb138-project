# Implementation Plan: Environment Separation and Automation

## Phase 1: Local Isolation & Seeding
- [ ] Task: Update `apps/server/.env.example` and documentation for local Docker Postgres.
- [ ] Task: Verify `src/db/seed.ts` works correctly with local Postgres.
- [ ] Task: Document local Clerk setup (redirects to localhost).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Local Isolation & Seeding' (Protocol in workflow.md)

## Phase 2: Clerk Webhooks Integration (TDD)
- [ ] Task: Create tests for Clerk webhook verification (signature check).
- [ ] Task: Implement `POST /api/webhooks/clerk` endpoint.
- [ ] Task: Create tests for `user.created` event (DB record creation).
- [ ] Task: Implement `user.created` handler.
- [ ] Task: Create tests for `user.updated` and `user.deleted` events.
- [ ] Task: Implement `user.updated` and `user.deleted` handlers.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Clerk Webhooks Integration' (Protocol in workflow.md)

## Phase 3: CI/CD Pipeline Establishment
- [ ] Task: Update GitHub Actions to include Drizzle migration step for Neon (using `drizzle-kit migrate`).
- [ ] Task: Integrate Render deployment webhook into GitHub Actions.
- [ ] Task: Integrate Vercel deployment into GitHub Actions.
- [ ] Task: End-to-end verification of the automated pipeline.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: CI/CD Pipeline Establishment' (Protocol in workflow.md)
