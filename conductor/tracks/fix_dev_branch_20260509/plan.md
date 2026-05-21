# Implementation Plan: Fix `dev` Branch Integrity

## Phase 1: Diagnosis & Research
- [x] Task: Review code changes from PRs #105, #101, #103, and #104 to identify potential sources of conflict or error.
- [x] Task: Check out the `dev` branch locally.
- [x] Task: Attempt to run the build (`bun run build`) and document the specific errors.
- [x] Task: Attempt to run the linter/type-checker (`bun run check`, `bun run check-types`) and document the errors.
- [x] Task: Attempt to run the test suite (`bun run test`) and document the high-level failure categories.
- [x] Task: Conductor - User Manual Verification .Phase 1. Diagnosis & Research' (Protocol in workflow.md)

## Phase 2: Build & Static Analysis Fixes
- [x] Task: Modify the `validate` script in the root `package.json` to remove the "OpenAPI drift" check. The generated `openapi.json` should not be committed.
- [x] Task: Review and update the CI configuration (`.github/workflows/ci.yml`) to remove any steps related to checking for OpenAPI drift.
- [x] Task: Address all TypeScript/ESLint/Biome configuration issues that may be causing build/lint failures.
- [x] Task: Fix all syntax errors and type mismatches reported by `tsc` until `bun run check-types` passes.
- [x] Task: Fix all linting and formatting issues reported by Biome until `bun run lint` and `bun run check` pass.
- [x] Task: Resolve dependency conflicts or issues in `bun.lock` if they are contributing to build failures.
- [x] Task: Iterate on fixes until `bun run build` completes successfully.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Build & Static Analysis Fixes' (Protocol in workflow.md)

## Phase 3: Test Suite Remediation
- [x] Task: With the build passing, run the test suite (`bun run test`).
- [ ] Task: Analyze the failing tests and group them by cause (e.g., component tests, integration tests, API tests).
- [x] Task: Address test failures, starting with the most foundational tests (e.g., unit tests).
    - [ ] Sub-task: Fix broken mocks or test setup.
    - [ ] Sub-task: Update tests to reflect valid API changes from the merges.
    - [ ] Sub-task: Fix regressions in application logic introduced by the merges.
- [x] Task: Iterate on test fixes until `bun run test` passes completely.
- [x] Task: Conductor - User Manual Verification .Phase 3. Test Suite Remediation' (Protocol in workflow.md)

## Phase 4: Runtime & E2E Validation
- [ ] Task: Start the application locally (`bun run dev`).
- [ ] Task: Manually test the core application flows identified in `product.md` to ensure no runtime errors occur.
    - [ ] Sub-task: Test user authentication flow.
    - [ ] Sub-task: Test wine catalog browsing and searching.
    - [ ] Sub-task: Test checkout flow.
- [ ] Task: Fix any runtime errors discovered during manual testing.
- [ ] Task: Run the end-to-end (E2E) test suite (`bun run test:e2e`) and fix any failures.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Runtime & E2E Validation' (Protocol in workflow.md)

## Phase 5: Final Validation & Cleanup
- [ ] Task: Run the comprehensive `validate` script (`bun run validate`) to ensure all checks pass in sequence.
- [ ] Task: Remove any temporary logging or debugging code added during the fix process.
- [ ] Task: Create a final commit with all the fixes.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Validation & Cleanup' (Protocol in workflow.md)
