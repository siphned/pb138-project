# Architecture Redesign: Unified Contract & Decoupled Domain

## Strategy
1. **Contract Unification**: Move Zod schemas to `@repo/shared`. Replace Orval with Kubb for modular API hook generation. Automate CI contract testing.
2. **Domain Decoupling**: Isolate Repository Layer. Services use Repository Interfaces (not Drizzle instances) to ensure pure business logic.

## Tasks
1. [ ] Create `docs/superpowers/specs/2026-04-28-architecture-redesign.md` with implementation details.
2. [ ] Refactor `@repo/shared` for centralized schema management.
3. [ ] Configure `kubb.config.ts` in `apps/web`.
4. [ ] Implement Repository interfaces in `apps/server/modules`.
5. [ ] Update CI workflows for schema drift detection.
6. [ ] Update project architecture, module, and API documentation to reflect changes.
7. [ ] Validate OpenAPI spec generation coverage for all new/refactored endpoints.
8. [ ] Append implementation log to `docs/logging/dev-log.md`.
9. [ ] Run pre-commit checks to verify structural integrity.
