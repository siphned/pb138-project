# Implementation Plan: Server Coverage OOM Resolution & Optimization

## Phase 1: Environment & Branch Setup
- [ ] Task: Create a separate git worktree for `track_oom_resolution`.
- [ ] Task: Create feature branch `WINE-61-oom-resolution` from `dev`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Implement Test Sharding
- [ ] Task: Add sharding scripts to `apps/server/package.json` (e.g., `test:shard:1`, `test:shard:2`).
- [ ] Task: Verify that sharded runs correctly collect partial coverage data.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Import Optimization & Heap Reduction
- [ ] Task: Identify and split large barrel files (`index.ts`) that cause excessive module loading.
- [ ] Task: Refactor core repositories/services to use more granular imports.
- [ ] Task: Verify peak heap usage reduction using `vitest --log-heap-usage`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: CI/CD Integration & Coverage Enforcement
- [ ] Task: Update `.github/workflows/ci.yml` to run server tests using a matrix for shards.
- [ ] Task: Implement a step to merge coverage reports from all shards.
- [ ] Task: Configure Vitest to fail the build if coverage falls below 90% target.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Final Verification & Wrap-up
- [ ] Task: Push changes and open MR `[WINE-61] Server Coverage OOM Resolution`.
- [ ] Task: Transition WINE-61 to "Done".
- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
