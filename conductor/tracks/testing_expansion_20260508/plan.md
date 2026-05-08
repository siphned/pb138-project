# Implementation Plan: Testing Harness Expansion

## Phase 1: Environment & Worktree Setup
- [x] Task: Create a separate git worktree for `track_testing_expansion`.
- [x] Task: Transition Jira issues WINE-61 and WINE-74 to "In Progress" (use smart commits: `chore(WINE-61): start testing expansion #in-progress`).
- [x] Task: Initialize testing libraries (K6 for performance, etc.).
- [x] Task: Configure Vitest coverage reporting in `apps/server` and `apps/web`.
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend (BE) Coverage Expansion
- [x] Task: Create branch `WINE-61-be-testing-expansion` from `dev`.
- [x] Task: Implement unit tests for `wine`, `cart`, `guest-session`, `auth`, `users` (target 100%).
- [x] Task: Expand integration tests for server modules (target 90% overall).
- [x] Task: Push branch and open MR `[WINE-61] BE testing harness expansion` into `dev`.
- [x] Task: Transition WINE-61 to "In Review".
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend (FE) Coverage Expansion
- [x] Task: Create branch `WINE-74-fe-testing-expansion` from `dev`.
- [x] Task: Expand component testing for core UI components using RTL.
- [x] Task: Expand unit tests for hooks and utility functions (90% overall).
- [x] Task: Push branch and open MR `[WINE-74] FE testing harness expansion` into `dev`.
- [x] Task: Transition WINE-74 to "In Review".
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: E2E, Performance & Security
- [x] Task: Create branch `WINE-61-e2e-perf-security` (grouped under WINE-61).
- [x] Task: Implement Playwright E2E flows (Checkout, Registration).
- [x] Task: Set up basic performance benchmarking.
- [x] Task: Integrate security scanning (e.g., `npm audit` in CI).
- [x] Task: Push branch and open MR `[WINE-61] E2E, Performance and Security` into `dev`.
- [x] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: CI Integration & Jira Completion
- [x] Task: Create branch `WINE-61-ci-enforcement`.
- [x] Task: Update GitHub Actions for coverage enforcement.
- [x] Task: Final verification of all coverage targets.
- [x] Task: Push branch and open MR `[WINE-61] CI coverage enforcement`.
- [x] Task: Transition WINE-61 and WINE-74 to "Done" (use smart commits: `chore(WINE-61): complete testing expansion #done`).
- [x] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
