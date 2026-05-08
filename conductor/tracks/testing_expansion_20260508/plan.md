# Implementation Plan: Testing Harness Expansion

## Phase 1: Environment & Worktree Setup
- [x] Task: Create a separate git worktree for `track_testing_expansion`.
- [x] Task: Transition Jira issues WINE-61 and WINE-74 to "In Progress" (use smart commits: `chore(WINE-61): start testing expansion #in-progress`).
- [x] Task: Initialize testing libraries (K6 for performance, etc.).
- [x] Task: Configure Vitest coverage reporting in `apps/server` and `apps/web`.
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend (BE) Coverage Expansion
- [ ] Task: Create branch `WINE-61-be-testing-expansion` from `dev`.
- [ ] Task: Implement unit tests for `wine`, `cart`, `guest-session`, `auth`, `users` (target 100%).
- [ ] Task: Expand integration tests for server modules (target 90% overall).
- [ ] Task: Push branch and open MR `[WINE-61] BE testing harness expansion` into `dev`.
- [ ] Task: Transition WINE-61 to "In Review".
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend (FE) Coverage Expansion
- [ ] Task: Create branch `WINE-74-fe-testing-expansion` from `dev`.
- [ ] Task: Expand component testing for core UI components using RTL.
- [ ] Task: Expand unit tests for hooks and utility functions (90% overall).
- [ ] Task: Push branch and open MR `[WINE-74] FE testing harness expansion` into `dev`.
- [ ] Task: Transition WINE-74 to "In Review".
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: E2E, Performance & Security
- [ ] Task: Create branch `WINE-61-e2e-perf-security` (grouped under WINE-61).
- [ ] Task: Implement Playwright E2E flows (Checkout, Registration).
- [ ] Task: Set up basic performance benchmarking.
- [ ] Task: Integrate security scanning (e.g., `npm audit` in CI).
- [ ] Task: Push branch and open MR `[WINE-61] E2E, Performance and Security` into `dev`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: CI Integration & Jira Completion
- [ ] Task: Create branch `WINE-61-ci-enforcement`.
- [ ] Task: Update GitHub Actions for coverage enforcement.
- [ ] Task: Final verification of all coverage targets.
- [ ] Task: Push branch and open MR `[WINE-61] CI coverage enforcement`.
- [ ] Task: Transition WINE-61 and WINE-74 to "Done" (use smart commits: `chore(WINE-61): complete testing expansion #done`).
- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
