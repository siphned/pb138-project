# Implementation Plan: Environment Separation and Automation

## Phase 1: Local Isolation & Seeding
- [x] Task: Update `apps/server/.env.example` and documentation for local Docker Postgres.
- [x] Task: Verify `src/db/seed.ts` works correctly with local Postgres.
- [x] Task: Document local Clerk setup (redirects to localhost).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Local Isolation & Seeding' (Protocol in workflow.md)

## Phase 2: Clerk Webhooks Integration (TDD)
- [x] Task: Create tests for Clerk webhook verification (signature check).
- [x] Task: Implement `POST /api/webhooks/clerk` endpoint.
- [x] Task: Create tests for `user.created` event (DB record creation).
- [x] Task: Implement `user.created` handler.
- [x] Task: Create tests for `user.updated` and `user.deleted` events.
- [x] Task: Implement `user.updated` and `user.deleted` handlers.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Clerk Webhooks Integration' (Protocol in workflow.md)

## Phase 3: CI/CD Pipeline Establishment
- [x] Task: Update GitHub Actions to include Drizzle migration step for Neon (using `drizzle-kit migrate`).
- [x] Task: Integrate Render deployment webhook into GitHub Actions.
- [x] Task: Integrate Vercel deployment into GitHub Actions.
- [x] Task: End-to-end verification of the automated pipeline.
- [x] Task: Conductor - User Manual Verification 'Phase 3: CI/CD Pipeline Establishment' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 3fca3df
