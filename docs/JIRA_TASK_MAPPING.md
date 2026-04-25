# Jira Task Mapping — WINE-121 Branch

**Analysis Date:** 2026-04-25  
**Branch:** WINE-121-wire-clerk-auth-to-frontend  
**Purpose:** Map all commits on this branch to existing Jira tasks or identify new tasks needed

---

## Summary

**Total commits on branch:** 10 (since divergence from main)  
**Clearly mapped to Jira:** 1 (WINE-121)  
**Related to known tasks:** 3 (audit, tests, documentation)  
**Need new Jira tasks:** 6 (no explicit WINE-XX reference)

---

## Commit-to-Task Mapping

### ✅ Clearly Mapped

#### Commit 1: f1a596c — `fix(WINE-121): resolve all audit findings from Clerk auth integration`
- **Jira Task:** WINE-121 ✅
- **Type:** Bug fix / Audit resolution
- **Description:** Resolves all 9 findings from the 2026-04-25 Clerk auth integration audit
- **Scope:** Backend RBAC guards, API schemas, frontend JSX fixes, dashboard wiring
- **Verification:** Full build passes, dev servers running

---

### ⚠️ Partially Mapped or Unclear

#### Commit 2: f762d7f — `docs: finalize audit folder structure and resolve all implementation integrity findings`
- **Likely Jira Task:** Related to WINE-121 or an audit tracking task
- **Type:** Documentation / Audit infrastructure
- **Description:** Creates folder-based audit structure
- **Status:** ❓ Unknown — could be part of WINE-121 or a separate audit task
- **Action:** If audit tracking is a separate epic, create task (e.g., **WINE-AUDIT** or similar)
- **Suggested Task (if needed):** `WINE-???: Audit documentation infrastructure and resolution tracking`

#### Commit 3: 49b011f — `fix(ui): use className instead of class in primitive components`
- **Likely Jira Task:** Part of WINE-121 or a separate JSX/React fix task
- **Type:** Bug fix
- **Description:** Fixes JSX attribute naming in UI components (class → className)
- **Status:** ❓ Unknown — commits message lacks WINE-XX reference
- **Action:** Verify if this is part of WINE-121 or needs separate task (e.g., **WINE-JEST** or UI linting)
- **Suggested Task (if separate):** `WINE-???: Fix JSX compliance in UI components`

#### Commit 4: b947684 — `feat(server): update repositories, services, and routes for consistency and integrity`
- **Likely Jira Task:** Part of WINE-59 or WINE-64 refactoring work
- **Type:** Feature / Refactoring
- **Description:** Broad server refactoring touching multiple modules
- **Status:** ❓ Unknown — no WINE-XX reference, unclear scope
- **Action:** Determine if this belongs to prior backend task or needs own task
- **Suggested Task (if separate):** `WINE-???: Backend module consistency and integrity refactoring`

#### Commit 5: dd4bc11 — `feat(db): standardize timestamps to timestamptz and add soft-delete support`
- **Likely Jira Task:** Database schema / migrations task
- **Type:** Feature / Database design
- **Description:** Standardizes timestamps across schema, adds soft-delete pattern
- **Status:** ❓ Unknown — no WINE-XX reference
- **Action:** Check if part of WINE-64 (products/availability) or schema cleanup
- **Suggested Task (if separate):** `WINE-???: Database schema standardization (timestamps, soft-deletes)`

#### Commit 6: 5d8d32d — `docs(audit): migrate to folder-based audit structure and update guidelines`
- **Likely Jira Task:** Audit infrastructure / documentation task
- **Type:** Documentation / Process
- **Description:** Restructures audit folder layout, creates audit guidelines
- **Status:** ❓ Unknown — no WINE-XX reference, could be meta-task
- **Action:** Determine if this should have its own tracking task
- **Suggested Task (if new):** `WINE-???: Audit documentation infrastructure`

#### Commit 7: 708e80b — `docs: finalize CLAUDE.md and README.md for Phase 2`
- **Likely Jira Task:** Documentation / project guidelines task
- **Type:** Documentation
- **Description:** Updates main project documentation for Phase 2 (implementation phase)
- **Status:** ❓ Unknown — no WINE-XX reference, documentation task
- **Action:** Check if this is tracked separately or ad-hoc
- **Suggested Task (if new):** `WINE-???: Update project documentation for Phase 2`

#### Commit 8: 9f54a3e — `chore: use vitest run for test scripts to ensure exit`
- **Likely Jira Task:** Test infrastructure task
- **Type:** Chore / Test setup
- **Description:** Fixes test runner configuration (vitest exit behavior)
- **Status:** ❓ Unknown — no WINE-XX reference, test infrastructure
- **Action:** Check if part of testing infrastructure epic or ad-hoc fix
- **Suggested Task (if new):** `WINE-???: Test infrastructure setup (Vitest configuration)`

#### Commit 9: 9138168 — `test: finalize comprehensive unit test suites`
- **Likely Jira Task:** Testing epic or dedicated test task
- **Type:** Testing
- **Description:** Completes unit test suite across all modules
- **Status:** ❓ Unknown — no WINE-XX reference, but clearly testing work
- **Action:** Check if tracked under testing epic
- **Suggested Task (if new):** `WINE-???: Comprehensive unit test suite development`

#### Commit 10: 21a5795 — `test: add comprehensive repository tests and setup web test environment`
- **Likely Jira Task:** Testing epic or dedicated test task
- **Type:** Testing
- **Description:** Repository layer tests + web app test setup
- **Status:** ❓ Unknown — no WINE-XX reference
- **Action:** Check if part of testing epic
- **Suggested Task (if new):** `WINE-???: Repository and web test environment setup`

---

## Task Creation Recommendations

Based on the analysis, here are recommended new Jira tasks if they don't already exist:

### High Priority (Directly Impact WINE-121)
1. **WINE-AUDIT-001:** Audit documentation infrastructure
   - Type: Task
   - Epic: Quality / Process
   - Description: Create and maintain folder-based audit structure with guidelines
   - Related: WINE-121

2. **WINE-SCHEMA-001:** Database schema standardization
   - Type: Task
   - Epic: Database / Infrastructure
   - Description: Standardize timestamps to timestamptz across all tables, implement soft-delete pattern
   - Related: WINE-121

### Medium Priority (Backend Infrastructure)
3. **WINE-BACKEND-001:** Backend module consistency refactoring
   - Type: Task
   - Epic: Backend / Code Quality
   - Description: Ensure repositories, services, and routes follow consistent patterns across all modules
   - Commits: b947684

### Lower Priority (Documentation & Testing)
4. **WINE-DOCS-001:** Project documentation Phase 2 update
   - Type: Task
   - Epic: Documentation
   - Description: Update CLAUDE.md, README, and other docs for Phase 2 (implementation)
   - Commits: 708e80b

5. **WINE-TEST-001:** Test infrastructure setup (Vitest)
   - Type: Task
   - Epic: Testing / Quality
   - Description: Configure Vitest with proper exit handling and test scripts
   - Commits: 9f54a3e

6. **WINE-TEST-002:** Comprehensive test suite development
   - Type: Task / Story
   - Epic: Testing / Quality
   - Description: Develop comprehensive unit and integration tests for all modules
   - Commits: 9138168, 21a5795
   - Estimate: Large (spans multiple commits)

---

## Current Jira Status (Known Tasks)

From git history and branch names, these Jira tasks are confirmed to exist:
- ✅ WINE-121: Wire Clerk auth to frontend
- ✅ WINE-79: Admin module (from commit references)
- ✅ WINE-66: Events module (from commit references)
- ✅ WINE-67: Reviews module (from commit references)
- ✅ WINE-65: Cart/orders module (from commit references)
- ✅ WINE-64: Products/availability modules (from commit references)
- ✅ WINE-63: Wines module (from commit references)
- ✅ WINE-56: Users module (from commit references)
- ✅ WINE-55: Auth module (from commit references)

---

## Recommendations

### For Matej (Team Lead)

1. **Verify Jira Against This Mapping**
   - Check which of the "unclear" commits are already tracked
   - Verify if testing and documentation are tracked under separate epics or as ad-hoc work

2. **Create Missing Tasks**
   - Create WINE-AUDIT-001 through WINE-TEST-002 if they don't exist
   - Ensure all work is tracked in Jira for sprint planning and assessment

3. **Update Commit Messages**
   - Going forward, ensure all commits include WINE-XX reference (per CLAUDE.md git workflow)
   - Examples:
     - ❌ `docs: finalize audit folder structure...`
     - ✅ `docs(WINE-AUDIT-001): finalize audit folder structure...`

4. **Link WINE-121 to Dependent Work**
   - Make WINE-121 "depends on" the schema task if not already completed
   - Mark test tasks as "relates to" WINE-121 for visibility

### For Code Review
- Use Jira task IDs to track which findings were fixed where
- Link PR description to multiple tasks if commit spans multiple concerns

---

## Action Items

- [ ] Verify which of the 10 commits are tracked in Jira
- [ ] Create missing JIRA tasks for untracked work
- [ ] Update commit messages to include WINE-XX IDs (if rewriting is acceptable)
- [ ] Link WINE-121 resolution to specific Jira fields/workflow
- [ ] Schedule team discussion on testing task structure (single epic vs. multiple tasks)
