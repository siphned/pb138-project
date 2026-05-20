# Coding Standards & Project Conventions — WineMarket

## 1. Tooling & Automation

### 1.1 Biome (Primary Tool)
- **Biome** is the sole source of truth for both linting and formatting.
- **References to ESLint or Prettier** in existing documentation are deprecated and should be updated.
- **Configuration**: Standardized in root `biome.json`.
- **Enforcement**: Run `bun run check` to verify and fix issues.

### 1.2 TypeScript Strictness
- **Strict Mode**: Must remain enabled in all `tsconfig.json` files.
- **No Unsafe Types**: Usage of `any` or `as unknown as` is strictly forbidden.
- **No Bypassing Lint**: Usage of `biome-ignore` comments is strictly prohibited unless explicitly approved by the user for a specific, documented technical necessity.
- **Type-Checking**: Run `bun run check-types` across the monorepo to ensure integrity.

### 1.3 Pre-push Validation
- **Mandate**: `bun run validate` **MUST** pass locally before any code is pushed to a remote branch.
- **Scope**: Validation includes Linting, Formatting, Type-Checking, Unit Tests, and OpenAPI drift detection.

---

## 2. Naming Conventions

### 2.1 File Naming (Split Convention)
- **Frontend Components**: `PascalCase.tsx` (e.g., `UserCard.tsx`, `Sidebar.tsx`).
- **Other Files**: `kebab-case.ts` or `dot.case.ts` (e.g., `auth.service.ts`, `tailwind.config.ts`, `error-boundary.tsx`).
- **Standardized Suffixes**: Use layer-based suffixes in the backend: `.routes.ts`, `.service.ts`, `.repository.ts`, `.schema.ts`.

### 2.2 Code Symbols
- **Variables & Functions**: `camelCase`.
- **Classes, Types, & Enums**: `PascalCase`.
- **Constants & Error Codes**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `CART_EMPTY`).

---

## 3. Backend Architecture: Three-Layer Pattern

### 3.1 Strict Layering
- **Flow**: `HTTP Routes -> Service Layer -> Repository Layer`.
- **Rule**: Routes must **never** call Repositories directly. All orchestration and business logic must reside in the Service layer.
- **Repository Responsibility**: Pure data access only. No business logic.

### 3.2 Error Handling
- **Custom Errors**: Use and extend `AppError` subclasses from `@repo/shared/errors/base.ts` (e.g., `NotFoundError`, `ForbiddenError`).
- **Standardized Codes**: Errors must use `UPPER_SNAKE_CASE` codes for consistent client-side handling.
- **Route Handling**: Use the `handleError(e)` helper in route handlers to ensure consistent HTTP status codes and responses.

### 3.3 Database Integrity
- **Transactions**: Any operation involving multiple database writes must be wrapped in a transaction (via Drizzle) to ensure atomicity.
- **Soft Deletes**: Use the `deletedAt` column for all entities requiring soft-delete. Queries must filter out deleted records (typically via a `excludeDeleted()` helper in the Repository).

---

## 4. Frontend Architecture & React Patterns

### 4.1 Component Isolation
- **UI vs. Logic**: Keep components focused on rendering. Move complex state or side effects into custom hooks (`hooks/`) or service modules.
- **One Component Per File**: Standardize on one exported component per file.

### 4.2 API Integration
- **Kubb Hooks**: Use **only** Kubb-generated TanStack Query hooks for API communication.
- **No Manual Fetch**: Avoid manual `fetch` or `axios` calls within components. If a special case exists, it must be abstracted into a service.

---

## 5. Security & System Stability

### 5.1 Environment Validation
- **Fail-Fast**: All environment variables must be validated at application startup using a Zod schema.
- **Constraint**: The application must throw a hard error if any required variable is missing or invalid (no silent fallbacks).

### 5.2 Error Safety
- **No Silent Failures**: Never use empty `.catch(() => {})` blocks. Every caught error must be logged (at minimum) or rethrown.
- **Structured Logging**: Use the project's standardized logger (e.g., pino) for all server-side logging.

---

## 6. Implementation & Refactoring
- **Refactoring**: When working in a module, follow the "Boy Scout Rule"—leave the code cleaner than you found it.
- **PR Size**: Prefer small, focused Pull Requests over large, multi-feature updates.
