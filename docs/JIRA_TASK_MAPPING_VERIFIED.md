# Jira Task Mapping — WINE-121 Branch (VERIFIED)

**Analysis Date:** 2026-04-25  
**Source:** Direct Jira API query on pb138winery project  
**Total tasks in Jira:** 120+ tasks across WINE project  
**Scope:** Map WINE-121 branch commits to confirmed Jira tasks

---

## Executive Summary

✅ **WINE-121 exists** and is "In Progress"  
✅ **9 supporting backend modules exist** (all Done or In Progress)  
✅ **Documentation & setup infrastructure exists** (mostly Done)  
⚠️ **Testing tasks exist but are BLOCKED** (WINE-60, WINE-61, WINE-74)  
❌ **No audit tracking tasks exist** — Audit work appears ad-hoc

---

## WINE-121 Branch: Commit-to-Task Mapping

### Primary Task: WINE-121

| Field | Value |
|-------|-------|
| **Key** | WINE-121 |
| **Summary** | Wire Clerk authentication to frontend (token management, guards, API integration) |
| **Type** | Story |
| **Status** | ✅ In Progress |
| **Link** | https://pb138winery.atlassian.net/browse/WINE-121 |

**Description:**
> As a user, I want to log in with email/password, register for an account, and log out, so that I can access my personalized dashboard and manage my profile.
>
> ## Acceptance Criteria
> - User can register a new account via sign-up form
> - User can log in with email/password
> - JWT token is stored securely on frontend
> - Authenticated requests include token in Authorization header
> - User is redirected to login if accessing protected routes without auth
> - User can log out, which clears session
> - User profile displays name/email after login
> - Refresh page maintains authentication state

**Commits mapping to WINE-121:**
```
f1a596c — fix(WINE-121): resolve all audit findings from Clerk auth integration
```

**Related work on branch:**
- 49b011f — fix(ui): use className instead of class (JSX fixes for WINE-121)
- Audit resolution work (9 findings across backend/frontend/database)

---

## Supporting Backend Modules (All Implemented)

These tasks provide the API infrastructure that WINE-121 depends on:

| Task | Summary | Status |
|------|---------|--------|
| **WINE-55** | Implement Auth module: register, login, JWT, logout, /me | ✅ Done |
| **WINE-56** | Implement Users module: profile CRUD, addresses, role requests | ✅ Done |
| **WINE-57** | Setup Kubb client generation from OpenAPI spec | ✅ Done |
| **WINE-59** | Build user dashboard skeleton and base component library | ✅ Done |
| **WINE-63** | Implement Wines module: CRUD, winemaker profile endpoints | ✅ Done |
| **WINE-64** | Implement Shops, Products & Bundles module endpoints | ✅ Done |
| **WINE-66** | Implement Events module: CRUD, registration, comments | ✅ Done |
| **WINE-79** | Implement Admin module: user management and content moderation | 🟡 Ready for Review |
| **WINE-65** | Implement Cart & Orders module: cart ops, checkout, order management | 🟡 In Progress |

---

## Frontend Page Implementation Tasks (To Do)

Frontend pages waiting for WINE-121 (and supporting modules) to be complete:

| Task | Summary | Status |
|------|---------|--------|
| **WINE-58** | Build auth pages: Login, Register, Forgot Password | 🟡 In Progress |
| **WINE-68** | Build wine catalog page with search and filters | ❌ To Do |
| **WINE-69** | Build wine detail page and winemaker profile pages | ❌ To Do |
| **WINE-70** | Build shop pages and product detail pages | ❌ To Do |
| **WINE-71** | Build shopping cart and checkout flow | ❌ To Do |
| **WINE-72** | Build event pages: browsing, detail, registration | ❌ To Do |
| **WINE-73** | Build user order history and profile management pages | ❌ To Do |

---

## Testing Infrastructure Tasks (BLOCKED ⚠️)

Critical testing tasks are blocked waiting for earlier work:

| Task | Summary | Status | Reason |
|------|---------|--------|--------|
| **WINE-60** | Setup Playwright E2E test infrastructure | 🔴 Blocked | Awaiting API stability |
| **WINE-61** | Write auth flow integration tests (register → login → /me) | 🔴 Blocked | Awaiting auth completion |
| **WINE-74** | Write E2E tests: checkout flow and event registration | 🔴 Blocked | Awaiting feature complete |

---

## Documentation & Infrastructure Tasks (Done)

Setup and documentation work (mostly complete):

| Task | Summary | Status |
|------|---------|--------|
| **WINE-100** | docs: Use case diagram and user interaction flows | 🟡 Ready for Review |
| **WINE-101** | docs: System architecture and design documentation | 🟡 Ready for Review |
| **WINE-102** | docs: Database schema and entity documentation | 🟡 Ready for Review |
| **WINE-104** | Establish base frontend folder infrastructure and file-based routing | ✅ Done |
| **WINE-106** | Build comprehensive wiki from course materials | ✅ Done |
| **WINE-107** | Establish working development environment and fix all bun commands | ✅ Done |
| **WINE-109** | Establish code review process and tracking format | ✅ Done |
| **WINE-110** | Setup local development database and shared packages structure | ✅ Done |
| **WINE-111** | Reorganize documentation into unified docs directory | ✅ Done |
| **WINE-112** | Fix Jira transition workflows to use REST API | ✅ Done |
| **WINE-113** | Update top-level README with project information | ✅ Done |
| **WINE-118** | Build fails in CI: missing test files and code generation directive | ✅ Done |

---

## Release Milestones (Planning Buckets)

| Task | Summary | Status | Timeline |
|------|---------|--------|----------|
| **WINE-75** | v0.2.0: Milestone 2 Release (Week 10) | ❌ To Do | Week 10 |
| **WINE-76** | v0.3.0-alpha: Polish & Testing (Week 11) | ❌ To Do | Week 11 |
| **WINE-77** | v0.3.0-rc: Release Candidate (Week 12) | ❌ To Do | Week 12 |
| **WINE-78** | v1.0.0: Production Ready (Week 13 — Milestone 3) | ❌ To Do | Week 13 |

---

## Commits Without Explicit WINE-XX Reference

Commits on WINE-121 branch that lack direct Jira references (should be tracked):

| Commit | Message | Likely Task | Recommendation |
|--------|---------|------------|-----------------|
| f762d7f | docs: finalize audit folder structure | Audit infrastructure | Link to WINE-121 or create WINE-AUDIT-001 |
| b947684 | feat(server): update repositories, services, routes | Backend refactoring | Link to WINE-64 or backend consistency epic |
| dd4bc11 | feat(db): standardize timestamps, soft-delete | Database schema | Related to WINE-54 (schema finalization) |
| 5d8d32d | docs(audit): migrate to folder-based structure | Audit process | Link to WINE-109 (code review process) |
| 708e80b | docs: finalize CLAUDE.md and README | Project docs | Link to WINE-113 (README update) |
| 9f54a3e | chore: use vitest run for test scripts | Test infrastructure | Link to WINE-60 (Playwright setup) |
| 9138168 | test: finalize comprehensive unit test suites | Testing work | Create or link to testing epic |
| 21a5795 | test: add repository tests, web test setup | Testing work | Create or link to testing epic |

---

## Recommendations for Jira Task Tracking

### Immediate Actions (For Matej)

1. **Link untracked commits to existing tasks:**
   - `dd4bc11` → Link to **WINE-54** (database schema finalization)
   - `5d8d32d` → Link to **WINE-109** (code review infrastructure)
   - `708e80b` → Link to **WINE-113** (README/docs update)

2. **Create new tasks if audit/testing are intentional tracking gaps:**
   - **WINE-AUDIT-001** (if audits are ongoing initiative)
   - **WINE-TEST-SUITE-001** (comprehensive unit/integration testing epic)

3. **Unblock testing tasks:**
   - Assess blockers on WINE-60, WINE-61, WINE-74
   - Determine if tests can begin in parallel with frontend work

4. **Enforce commit message convention going forward:**
   - All commits must include `(WINE-XX)` in scope
   - Enforce in git hooks or CI/CD pipeline

### Future Sprint Planning

Next priorities (based on Jira status):

1. **Unblock WINE-65** (Cart & Orders) — Currently In Progress
2. **Review WINE-67, WINE-79** (Reviews, Admin) — Ready for Review status
3. **Begin WINE-68-73** (Frontend pages) — Waiting for backend modules to stabilize
4. **Unblock WINE-60, WINE-61, WINE-74** (Testing) — Critical for quality

---

## Jira Project Health

| Metric | Value |
|--------|-------|
| **Total tasks in project** | 120+ |
| **Done** | ~25 tasks (20%) |
| **In Progress** | ~5 tasks (5%) |
| **Ready for Review** | ~3 tasks (3%) |
| **Blocked** | ~3 tasks (3%) |
| **To Do** | ~84 tasks (70%) |
| **Milestones defined** | 4 (v0.2.0 through v1.0.0) |
| **Modules implemented** | 9/11 core modules |
| **Documentation** | Mostly complete, some in review |

---

## Summary

**WINE-121 situation:**
- ✅ Main task exists and is properly tracked in Jira
- ✅ All supporting backend modules implemented or in review
- ⚠️ 8 commits on branch lack explicit WINE-XX reference
- 🟡 Testing infrastructure blocked (not a blocker for WINE-121 specifically)
- ✅ Documentation infrastructure complete

**Action items:**
1. Link untracked commits to WINE-54, WINE-109, WINE-113
2. Review if audit tracking (WINE-AUDIT-001) should be created
3. Consider creating comprehensive testing epic (WINE-TEST-SUITE-001)
4. Enforce commit message convention in future work
5. Prepare WINE-65 and WINE-79 for merge after WINE-121 closes

---

**Last verified:** 2026-04-25 via Jira API
