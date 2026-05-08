# Implementation Plan: WINE-69 Shipping

## Phase 1: Selective Isolation & Environment Setup
- [x] Task: Create git worktree `track_wine_69_shipping` and checkout branch `WINE-69-wine-and-winemakers-profile`.
- [x] Task: Selectively move WINE-69 changes (Backend filters, Review endpoints, Frontend components/routes) to the new branch.
- [x] Task: Revert/Stash unrelated changes in the main directory.
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Formalization (TDD)
- [x] Task: Write integration tests for `GET /products?wineId=...` filter.
- [x] Task: Write integration tests for Wine Review endpoints.
- [x] Task: Refactor backend implementation to strictly follow Repository/Service patterns if needed.
- [x] Task: Verify backend tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend Polish & Testing (TDD)
- [x] Task: Write unit tests for `WinesAvailableInShops`, `WinemakerTabs`, and profile components.
- [x] Task: Review UI implementation against Design Guidelines (accessibility, responsiveness, consistency).
- [x] Task: Refactor frontend components for better separation of concerns (Logic hooks vs Presentational components).
- [x] Task: Verify frontend unit tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Integration & E2E Validation
- [x] Task: Write Playwright E2E test for "Wine Detail -> Shop -> Add to Cart" flow.
- [x] Task: Write Playwright E2E test for "Winemaker Profile -> Tab Navigation -> Wine Detail" flow.
- [x] Task: Run full targeted test suite.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Final Review & Merge Prep
- [x] Task: Final Biome lint and TypeScript check.
- [x] Task: Review code against Standards (Repository usage, naming conventions).
- [x] Task: Prepare MR and transition Jira WINE-69 to "Done".
- [x] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
