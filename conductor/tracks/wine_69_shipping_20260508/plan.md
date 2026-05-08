# Implementation Plan: WINE-69 Shipping

## Phase 1: Selective Isolation & Environment Setup
- [ ] Task: Create git worktree `track_wine_69_shipping` and checkout branch `WINE-69-wine-and-winemakers-profile`.
- [ ] Task: Selectively move WINE-69 changes (Backend filters, Review endpoints, Frontend components/routes) to the new branch.
- [ ] Task: Revert/Stash unrelated changes in the main directory.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Formalization (TDD)
- [ ] Task: Write integration tests for `GET /products?wineId=...` filter.
- [ ] Task: Write integration tests for Wine Review endpoints.
- [ ] Task: Refactor backend implementation to strictly follow Repository/Service patterns if needed.
- [ ] Task: Verify backend tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend Polish & Testing (TDD)
- [ ] Task: Write unit tests for `WinesAvailableInShops`, `WinemakerTabs`, and profile components.
- [ ] Task: Review UI implementation against Design Guidelines (accessibility, responsiveness, consistency).
- [ ] Task: Refactor frontend components for better separation of concerns (Logic hooks vs Presentational components).
- [ ] Task: Verify frontend unit tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Integration & E2E Validation
- [ ] Task: Write Playwright E2E test for "Wine Detail -> Shop -> Add to Cart" flow.
- [ ] Task: Write Playwright E2E test for "Winemaker Profile -> Tab Navigation -> Wine Detail" flow.
- [ ] Task: Run full targeted test suite.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Final Review & Merge Prep
- [ ] Task: Final Biome lint and TypeScript check.
- [ ] Task: Review code against Standards (Repository usage, naming conventions).
- [ ] Task: Prepare MR and transition Jira WINE-69 to "Done".
- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
