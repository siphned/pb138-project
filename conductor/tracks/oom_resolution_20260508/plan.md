# Implementation Plan: Server Coverage OOM Resolution & Optimization

## Phase 1: Environment & Branch Setup
- [x] Task: Create a separate git worktree for `track_oom_resolution`.
- [x] Task: Create feature branch `WINE-61-oom-resolution` from `dev`.
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Implement Test Sharding
- [x] Task: Add sharding scripts to `apps/server/package.json` (e.g., `test:shard:1`, `test:shard:2`).
- [x] Task: Verify that sharded runs correctly collect partial coverage data.
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Import Optimization & Heap Reduction
- [x] Task: Identify and split large barrel files (`index.ts`) that cause excessive module loading.
- [x] Task: Refactor core repositories/services to use more granular imports.
- [x] Task: Verify peak heap usage reduction using `vitest --log-heap-usage`.
- [x] Task: Conductor - User Manual Verification .Phase 3. (Protocol in workflow.md)

## Phase 4: CI/CD Integration & Coverage Enforcement
- [x] Task: Update `.github/workflows/ci.yml` to run server tests using a matrix for shards.
- [x] Task: Implement a step to merge coverage reports from all shards.
- [x] Task: Configure Vitest to fail the build if coverage falls below 90% target.
- [x] Task: Conductor - User Manual Verification .Phase 4. (Protocol in workflow.md)

## Phase 5: Final Verification & Wrap-up
- [x] Task: Push changes and open MR `[WINE-61] Server Coverage OOM Resolution`.
- [x] Task: Transition WINE-61 to "Done".
- [x] Task: Conductor - User Manual Verification .Phase 5. (Protocol in workflow.md)
