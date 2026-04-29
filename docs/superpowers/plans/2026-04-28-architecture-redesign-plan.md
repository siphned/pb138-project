# Architecture Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify contract management with Kubb and decouple backend services from database repository layers.

**Architecture:** Contract-first via shared Zod schemas. Services communicate with DB via injected Repository Interfaces, not direct Drizzle instances.

**Tech Stack:** Elysia, Drizzle, Kubb, TanStack Query, Zod.

---

### Task 1: Initialize Shared Schema Refactoring

**Files:**
- Modify: `packages/shared/src/index.ts`
- Modify: `apps/server/src/db/schema/index.ts`

- [ ] **Step 1: Move central Zod schemas to `@repo/shared`**

Move all shared domain schemas from `apps/server/src/db/schema` to `packages/shared/src/schemas`.

- [ ] **Step 2: Update server imports**

Update `apps/server/src/db/schema/index.ts` to re-export schemas from `@repo/shared`.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas apps/server/src/db/schema/index.ts
git commit -m "refactor(shared): centralize domain schemas"
```

### Task 2: Configure Kubb Generation

**Files:**
- Create: `apps/web/kubb.config.ts`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Create `kubb.config.ts`**

Configure Kubb to output TanStack Query hooks based on OpenAPI spec.

```typescript
import { defineConfig } from '@kubb/core'

export default defineConfig({
  input: { path: './swagger.json' },
  output: { path: './src/generated' },
  plugins: [
    ['@kubb/swagger', { output: false }],
    ['@kubb/swagger-tanstack-query', { output: './src/generated/hooks' }],
  ],
})
```

- [ ] **Step 2: Add script to `package.json`**

```json
"scripts": {
  "generate": "kubb generate"
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/kubb.config.ts apps/web/package.json
git commit -m "feat(web): configure kubb for modular generation"
```

### Task 3: Decouple Service Layer (Repository Pattern)

**Files:**
- Modify: `apps/server/src/modules/auth/auth.repository.ts`
- Modify: `apps/server/src/modules/auth/auth.service.ts`

- [ ] **Step 1: Define Repository Interface**

In `auth.repository.ts`, define `IAuthRepository` interface.

```typescript
export interface IAuthRepository {
  findById(id: string): Promise<User | null>;
  // ...
}
```

- [ ] **Step 2: Inject into Service**

Update `auth.service.ts` constructor to accept `IAuthRepository`.

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/modules/auth/auth.repository.ts apps/server/src/modules/auth/auth.service.ts
git commit -m "refactor(server): decouple auth service with repository pattern"
```

### Task 4: CI & Documentation

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `docs/ARCHITECTURE/architecture.md`

- [ ] **Step 1: Add contract validation to CI**

Add check for schema drift in `ci.yml`.

- [ ] **Step 2: Update Docs**

Reflect repository pattern and Kubb workflow in architecture docs.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml docs/ARCHITECTURE/architecture.md
git commit -m "chore(ci): add contract validation"
```

### Task 5: Pre-commit Verification

- [ ] **Step 1: Run pre-commit checks**

Execute build, type check, and lint.

```bash
npm run build && npm run lint
```

- [ ] **Step 2: Append to dev-log**

```bash
echo "2026-04-28: Implemented architecture redesign. Shared schemas active. Kubb configured. Repository pattern enforced." >> docs/logging/dev-log.md
```
