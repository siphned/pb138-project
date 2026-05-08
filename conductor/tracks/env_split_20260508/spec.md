# Specification: Environment Separation and Automation

## Overview
Isolate local development from production and establish automated CI/CD pipelines. Ensure developers can work locally with Docker Postgres and separate Clerk instances, while `main` branch pushes automatically update the production stack on Vercel, Render, and Neon.

## Functional Requirements
- **Local Isolation**:
    - Configure apps to use local Docker Postgres.
    - Implement seeding script verification.
- **Clerk Integration**:
    - Set up a new Clerk instance for production.
    - Implement `POST /api/webhooks/clerk` on the backend to sync user data (creation, update, delete).
    - Verify webhook signatures using Svix or `@clerk/backend`.
- **CI/CD Automation**:
    - Create/Update GitHub Actions to:
        - Apply Drizzle migrations to Neon.
        - Deploy Backend to Render.
        - Deploy Frontend to Vercel.

## Non-Functional Requirements
- **Security**: Zero production keys in local `.env.local` files.
- **Reliability**: Automated validation (lint, test) must pass before any deployment.

## Acceptance Criteria
- [ ] Local environment runs entirely on Docker Postgres.
- [ ] Seeding script successfully populates local DB.
- [ ] Clerk webhooks successfully sync user data from Clerk to DB.
- [ ] Push to `main` triggers DB migration + dual deployment (Vercel & Render).

## Out of Scope
- Migrating historical user data from Dev Clerk to Prod Clerk.
- Performance tuning of the CI/CD pipeline.
