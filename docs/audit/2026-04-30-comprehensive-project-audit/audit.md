# Audit — Comprehensive Project State Review (2026-04-30)

## Meta
- **Date:** 2026-04-30
- **Auditor:** Senior Dev Mentor / TA Review (Automated)
- **Scope:** Full project state — database, backend, frontend, infrastructure, documentation, testing, team process
- **Status:** OPEN
- **Branch:** `WINE-157-resolve-audit-findings` (16 commits ahead of main)
- **Context:** Week 8 of 13 — between Milestone 2 (Week 10) and Milestone 3 (Week 13)

---

## Summary

The WineMarket project is in **strong shape for a Week 8 student project**. The architecture is well-designed and consistently implemented across 13 backend modules with 47 API endpoints, 23 database tables, and a complete frontend route structure. Build is green (TypeScript passes), all 270 tests pass (224 server + 46 web), and documentation is comprehensive. The team has made mature architectural decisions (repository pattern, Clerk auth, Kubb code generation, soft-deletes).

**Key strengths:** Consistent layered architecture, strong type safety pipeline (Zod → OpenAPI → Kubb), comprehensive test coverage for a student project, excellent documentation.

**Key risks:** Missing email integration triggers, incomplete admin/moderation UI, no deployment to staging, some service-layer code quality issues identified in prior audits still pending, E2E test coverage minimal.

---

## Findings

### F-01: Email Module Not Wired to Business Flows

- **Area:** backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** Email service exists (`apps/server/src/modules/email/`) using Resend SDK with HTML templates. Service is functional but never called from any route or service.
- **Expected state:** Per PRD requirements AU-2 (registration confirmation), AU-8 (password reset), OR-6 (order confirmation), and EV-5 (event approval notification) all require email notifications.
- **Divergence:** Email module was implemented as standalone service but integration with order, event, and auth flows was never completed.
- **Decision:** Pending team discussion on which triggers are mandatory for Milestone 3.
- **Action items:**
  - [ ] Wire `emailService.send()` into `ordersService.checkout()` for order confirmation
  - [ ] Wire into `adminService.approveEvent()` for winemaker notification
  - [ ] Wire into role-request approval flow
  - [ ] Add email trigger on user registration (via Clerk webhook or post-registration hook)

---

### F-02: Admin & Moderation Frontend Pages Are Stubs

- **Area:** frontend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** Admin routes exist (`/_authenticated/_admin/admin`, `/moderation`, `/role-requests`, `/users`) but render minimal stub components. The role-gating works (admin guard checks `useRoles()`), but actual CRUD UI for user management, event moderation, and review moderation is not implemented.
- **Expected state:** Per PRD BO-1 through BO-6, admin must be able to: manage users (suspend/ban), approve role requests, moderate events (approve/reject), moderate reviews, view platform statistics.
- **Divergence:** Backend API for all admin operations is complete (6 admin endpoints). Frontend just needs to consume the generated hooks.
- **Decision:** N/A — straightforward implementation needed.
- **Action items:**
  - [ ] Implement admin user management page (table with status toggle) using `useGetAdminUsers` + `usePatchAdminUsersByIdStatus`
  - [ ] Implement role-request management page using `useGetRoleRequests` + approve/reject mutations
  - [ ] Implement event moderation page using `useGetAdminEvents` + approve/reject mutations
  - [ ] Implement review moderation page using `useGetAdminReviews` + `useDeleteAdminReviewsById`
  - [ ] Add basic statistics dashboard (counts from existing endpoints)

---

### F-03: N+1 Query in UsersService.syncRolesToDatabase

- **Area:** backend
- **Severity:** major
- **Status:** ❌ open (identified in prior audit 2026-04-30)
- **Current state:** `syncRolesToDatabase` in `users.service.ts` loops through roles with sequential `await` calls — up to 7 DB round-trips per login for a user with 4 existing + 3 new roles.
- **Expected state:** Batch operations — single DELETE for removed roles + single INSERT for new roles.
- **Divergence:** Quick implementation during auth module buildout, never optimized.
- **Decision:** D-01 from prior audit: batch the operations.
- **Action items:**
  - [ ] Refactor `syncRolesToDatabase` to use batch DELETE + INSERT
  - [ ] Add/update test for batched role sync

---

### F-04: Service Method Duplication in UsersService

- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open (identified in prior audit)
- **Current state:** Duplicate method pairs: `getAddresses`/`getAddressesForUser` and `upsertAddress`/`upsertAddressForUser` with identical logic but different parameter shapes.
- **Expected state:** Single method per operation with unified parameter interface.
- **Divergence:** Iterative development added convenience wrappers without consolidating.
- **Action items:**
  - [ ] Consolidate to single `getAddresses(userId)` and `upsertAddress(userId, type, data)`
  - [ ] Update all callers

---

### F-05: No Deployment to Staging Environment

- **Area:** toolchain
- **Severity:** major
- **Status:** ❌ open
- **Current state:** Docker Compose exists for local PostgreSQL + pgAdmin. CI runs lint/typecheck/build/test. No deployment pipeline to any staging/production environment.
- **Expected state:** Per Milestone 2 requirements: "Deployed to staging or development environment."
- **Divergence:** Team focused on feature implementation. Deployment was deferred.
- **Decision:** Pending — options: Fly.io, Railway, Render, or university hosting.
- **Action items:**
  - [ ] Choose deployment target
  - [ ] Add deployment job to CI pipeline
  - [ ] Configure production environment variables
  - [ ] Deploy and verify end-to-end flow

---

### F-06: E2E Test Coverage Minimal

- **Area:** frontend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** 2 Playwright test files: `auth.spec.ts` (8 tests, redirect behavior) and `routing.spec.ts` (basic navigation). Tests run on iPhone 11 viewport only.
- **Expected state:** Per course requirements: "E2E tests (via Cypress/Playwright) with meaningful coverage." Critical user flows (browse → add to cart → checkout, login → dashboard, admin moderation) should have E2E coverage.
- **Divergence:** E2E tests were added as proof-of-concept but not expanded to cover business flows.
- **Action items:**
  - [ ] Add E2E test: browse wines → view detail → add to cart → view cart
  - [ ] Add E2E test: login flow → dashboard → role-based content
  - [ ] Add E2E test: shop management flow (if time permits)
  - [ ] Add desktop viewport tests (not just mobile)

---

### F-07: Checkout Flow Missing Payment Simulation

- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** `POST /orders/checkout` creates order, decrements stock, clears cart. Payment status defaults to `pending`. No simulation of payment success/failure.
- **Expected state:** PRD says "Payment simulated (no real payment gateway)." At minimum, should simulate payment success after checkout (auto-transition to `paid` status).
- **Divergence:** Payment simulation was noted as out-of-scope initially but PRD lists it as required.
- **Action items:**
  - [ ] Add simulated payment endpoint or auto-transition order to `paid` on checkout
  - [ ] Add order status update endpoint (PATCH /orders/:id/status) for shop owners

---

### F-08: Missing Order Listing Endpoint for Customers

- **Area:** backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** Only `GET /orders/:id` exists (single order by ID). No endpoint to list all orders for a customer.
- **Expected state:** Per PRD OR-3: "Customer can view their order history." Needs `GET /orders` (filtered by authenticated user).
- **Divergence:** Endpoint was in API spec but not implemented.
- **Action items:**
  - [ ] Add `GET /orders` endpoint returning paginated orders for authenticated user
  - [ ] Add `GET /admin/orders` or `GET /shops/:id/orders` for shop owners to view their shop's orders
  - [ ] Regenerate Kubb hooks after adding endpoints

---

### F-09: Guest Cart Merge Logic Partially Tested

- **Area:** backend
- **Severity:** minor
- **Status:** 🔄 in progress
- **Current state:** Cart merge logic exists in `cartsService.mergeOnLogin()`. Unit tests exist for cart service. However, the full flow (guest adds items → logs in → items appear in user cart) is not tested end-to-end.
- **Expected state:** Integration test covering the merge flow, especially edge cases (duplicate products, quantity summing).
- **Action items:**
  - [ ] Add integration test for guest→user cart merge with duplicate handling
  - [ ] Verify merge behavior in E2E test

---

### F-10: Soft-Delete Filtering Inconsistent Across Repositories

- **Area:** backend
- **Severity:** minor
- **Status:** 🔄 in progress
- **Current state:** Most repositories filter `deletedAt IS NULL` in queries. Some edge cases remain: order items may reference soft-deleted products (by design — price frozen at purchase), but event listings may show events from soft-deleted winemakers.
- **Divergence:** Decision D-01 (prior audit) established that deleted products shown in order history is intentional. Deleted winemaker handling (archive account) not yet implemented.
- **Action items:**
  - [ ] Verify events repository filters out events from deleted winemakers
  - [ ] Document which joins intentionally skip soft-delete filters (order_items → products)

---

### F-11: No Rate Limiting on API Endpoints

- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** No rate limiting middleware on any endpoint. Checkout, registration, and login endpoints are exposed without throttling.
- **Expected state:** Production-grade API should have at minimum rate limiting on auth endpoints and checkout.
- **Divergence:** Not in original PRD requirements. Good practice for defense presentation.
- **Action items:**
  - [ ] Add Elysia rate-limiting plugin (or simple IP-based limiter) on auth and checkout endpoints

---

### F-12: Frontend Missing Loading/Error States on Some Pages

- **Area:** frontend
- **Severity:** minor
- **Status:** 🔄 in progress
- **Current state:** Some pages (wine catalog, shop pages) have proper loading skeletons. Others (dashboard tabs, admin pages) show minimal loading feedback.
- **Expected state:** Per routes spec: all pages should handle loading (skeleton/spinner), error (alert + retry), and empty states.
- **Action items:**
  - [ ] Add loading skeletons to dashboard tabs
  - [ ] Add error boundaries to route layouts
  - [ ] Add empty state messages to list views

---

### F-13: Winemaker Profile Creation Flow Missing

- **Area:** frontend + backend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `PATCH /winemakers/me` exists for updating an existing winemaker profile. But there's no `POST /winemakers` endpoint for creating a winemaker profile after a role-request is approved. The backend has the role-request flow, but after approval the user doesn't have a way to set up their winemaker profile (name, description, address).
- **Expected state:** After admin approves a winemaker role-request, user should be able to create their winemaker profile.
- **Divergence:** Winemaker creation may happen automatically via role-request approval, but the profile setup form is missing from frontend.
- **Action items:**
  - [ ] Verify backend creates winemaker record on role-request approval (or add endpoint)
  - [ ] Add winemaker onboarding page/modal in frontend
  - [ ] Same for shop owner — verify shop creation flow exists after approval

---

### F-14: Supply Agreements Feature Incomplete on Frontend

- **Area:** frontend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** Backend has full supply-agreements CRUD (4 endpoints). Frontend has a `supply-browse.tsx` route under shop management but no winemaker-side UI for managing incoming agreement requests.
- **Expected state:** Both shop owners (requesting supply) and winemakers (approving/rejecting) should have UI.
- **Action items:**
  - [ ] Add winemaker supply management page using `useGetSupplyAgreementsWinemaker` + `usePatchSupplyAgreementsById`
  - [ ] Complete shop owner supply browsing page

---

### F-15: Event Comments Not Surfaced in Frontend

- **Area:** frontend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** Backend has `GET/POST /events/:id/comments` endpoints. Frontend event detail page exists but doesn't render or allow posting comments.
- **Expected state:** Event detail page should show comments and allow authenticated users to post.
- **Action items:**
  - [ ] Add comments section to event detail page using `useGetEventsByIdComments` + `usePostEventsByIdComments`

---

### F-16: No Dark Mode Toggle in UI

- **Area:** frontend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** CSS variables for dark mode are fully defined in `index.css`. Tailwind `dark:` variant is configured. But there's no UI toggle to switch between light and dark mode. The system likely follows OS preference via `@custom-variant dark`.
- **Expected state:** Per course requirements: "Theme Support: Light and dark mode across entire application." Needs explicit toggle.
- **Action items:**
  - [ ] Add theme toggle component (sun/moon icon in header)
  - [ ] Add `ThemeProvider` context to persist user preference in localStorage
  - [ ] Ensure all pages render correctly in both modes

---

### F-17: CORS Hardcoded to localhost

- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** `app.ts` has `.use(cors({ origin: "http://localhost:5173" }))`. This will break when deployed.
- **Expected state:** CORS origin should come from environment variable (e.g., `FRONTEND_URL`).
- **Action items:**
  - [ ] Change CORS origin to `process.env.FRONTEND_URL || "http://localhost:5173"`

---

### F-18: Module-Level Clerk Client Initialization

- **Area:** backend
- **Severity:** minor
- **Status:** ❌ open (from prior audit)
- **Current state:** `createClerkClient()` in `users.service.ts` is called at module load time. If `CLERK_SECRET_KEY` is missing, the module fails at import — not at method call time.
- **Expected state:** Lazy initialization or startup validation.
- **Action items:**
  - [ ] Move Clerk client creation to lazy getter or validate env var at startup

---

## Findings Summary

| # | Finding | Area | Severity | Status |
|---|---------|------|----------|--------|
| F-01 | Email not wired to business flows | backend | major | ❌ open |
| F-02 | Admin/moderation pages are stubs | frontend | major | ❌ open |
| F-03 | N+1 query in role sync | backend | major | ❌ open |
| F-04 | Duplicate methods in UsersService | backend | minor | ❌ open |
| F-05 | No staging deployment | toolchain | major | ❌ open |
| F-06 | E2E test coverage minimal | frontend | major | ❌ open |
| F-07 | Missing payment simulation | backend | minor | ❌ open |
| F-08 | Missing order listing endpoint | backend | major | ❌ open |
| F-09 | Guest cart merge partially tested | backend | minor | 🔄 in progress |
| F-10 | Soft-delete filtering inconsistent | backend | minor | 🔄 in progress |
| F-11 | No rate limiting | backend | minor | ❌ open |
| F-12 | Missing loading/error states | frontend | minor | 🔄 in progress |
| F-13 | Winemaker/Shop profile creation flow | FE+BE | major | ❌ open |
| F-14 | Supply agreements frontend incomplete | frontend | minor | ❌ open |
| F-15 | Event comments not in frontend | frontend | minor | ❌ open |
| F-16 | No dark mode toggle | frontend | minor | ❌ open |
| F-17 | CORS hardcoded to localhost | backend | minor | ❌ open |
| F-18 | Clerk client module-level init | backend | minor | ❌ open |

**Totals:** 6 major, 12 minor, 0 critical

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | Batch role sync queries (from prior audit) | N+1 performance issue on every login | 🔄 pending |
| D-02 | Deleted products visible in order history | Price frozen at purchase time; makes business sense | ✅ done |
| D-03 | Auth routes consolidated to `/auth/*` | Single namespace for auth | ✅ done |
| D-04 | Multi-role via `user_roles` junction table | Users can be winemaker + shop_owner simultaneously | ✅ done |
| D-05 | Repository pattern for all modules | Testability, separation of concerns | ✅ done |
| D-06 | Kubb replaces Orval | Better v4 support, simpler config | ✅ done |
| D-07 | Biome replaces ESLint + Prettier | Single tool, faster, strict rules | ✅ done |

---

## Project Health Scorecard

| Category | Score | Weight | Weighted | Status |
|----------|-------|--------|----------|--------|
| Architecture & Design | 95% | 0.15 | 14.25% | ✅ PASSED |
| Database & Schema | 92% | 0.10 | 9.20% | ✅ PASSED |
| Backend API Implementation | 85% | 0.20 | 17.00% | ✅ PASSED |
| Frontend Implementation | 60% | 0.20 | 12.00% | ⚠️ AT RISK |
| Testing | 70% | 0.15 | 10.50% | ⚠️ PARTIAL |
| Infrastructure & CI/CD | 75% | 0.10 | 7.50% | ⚠️ PARTIAL |
| Documentation | 95% | 0.10 | 9.50% | ✅ PASSED |
| **TOTAL** | — | **1.00** | **79.95%** | **⚠️ PARTIAL** |

### Score Justification

- **Architecture (95%):** Consistent 3-layer pattern, clean module boundaries, well-designed DB schema. Minor deduction for service-layer duplication.
- **Database (92%):** 23 tables, proper relations, soft-deletes, enums. Minor: no index strategy documented.
- **Backend API (85%):** 47 endpoints, auth macros, repository pattern. Missing: order listing, email triggers, payment simulation.
- **Frontend (60%):** Route structure complete, Kubb hooks generated, auth guards working. Missing: admin UI, several feature pages are stubs, no dark mode toggle.
- **Testing (70%):** 270 passing tests (impressive for student project). Missing: E2E business flows, integration tests for complex scenarios.
- **Infrastructure (75%):** CI passes, Docker for local dev. Missing: staging deployment, rate limiting.
- **Documentation (95%):** Exceptional — wiki, architecture docs, API spec, audit trail. Minor: some docs reference Orval (stale).

---

## Outstanding Work

Ordered by priority for Milestone 3 success:

### Critical Path (Must complete before Milestone 3)
1. **F-08:** Add order listing endpoints (GET /orders for customers, GET /shops/:id/orders for shop owners)
2. **F-02:** Implement admin UI pages (user mgmt, event moderation, review moderation, role requests)
3. **F-13:** Winemaker/Shop onboarding flow after role approval
4. **F-01:** Wire email service to at least order confirmation + role-request notification
5. **F-16:** Add dark mode toggle (course requirement)
6. **F-06:** Add 3-5 meaningful E2E tests covering critical user flows

### Important (Should complete)
7. **F-05:** Deploy to staging environment
8. **F-03:** Fix N+1 query in role sync
9. **F-07:** Add payment simulation (auto-transition to paid)
10. **F-15:** Add event comments to frontend
11. **F-14:** Complete supply agreements UI

### Nice-to-have (Time permitting)
12. **F-04:** Consolidate duplicate service methods
13. **F-17:** Make CORS configurable from env
14. **F-18:** Lazy-load Clerk client
15. **F-11:** Add rate limiting
16. **F-12:** Polish loading/error states
17. **F-10:** Document soft-delete filter policy

---

**End of Audit**
