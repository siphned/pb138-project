# Audit — Comprehensive System Integrity & Redesign Review (2026-04-26)

## Meta
- **Date:** 2026-04-26 (evening)
- **Auditor:** Claude Code (Agent)
- **Scope:** Full codebase + all documentation branches merged to dev
- **Status:** OPEN (blocking implementation until critical issues resolved)
- **Review Type:** Code integrity + Documentation consistency + Redesign opportunities

---

## Executive Summary

The system has successfully integrated milestone 1 documentation branches (WINE-95 through WINE-106) into dev. The latest audit from 2026-04-26 afternoon identified several remaining issues from earlier design phases. **Upon re-examination of the current dev branch, most previously-claimed issues have been resolved, but several new consistency issues and design flaws have been discovered.**

### Critical Issues (blocks functionality)
1. **C-01**: Order items return soft-deleted products — users see unavailable items
2. **C-02**: Events from deleted winemakers appear in listings — orphaned content visible
3. **C-03**: Duplicate auth routes (/login + /auth/login) — frontend routing ambiguity

### Major Issues (contradicts architecture)
4. **M-01**: Inconsistent soft-delete checking across repositories
5. **M-02**: Missing winemaker deletion check in event queries
6. **M-03**: API schema ambiguity in role assignment (role vs roles field)

### Design Opportunities
7. **D-01**: Soft-delete pattern not systematically applied — should be standardized
8. **D-02**: Error handling inconsistent — 100+ `throw new Error("CODE")` statements
9. **D-03**: Frontend route architecture could be simplified
10. **D-04**: Database schema documentation incomplete

---

## Findings

### P0 — Critical (blocks operation)

#### C-01: Order Items Return Soft-Deleted Products
- **Area:** backend / database
- **Severity:** critical (data integrity + UX)
- **Current state:** `ordersRepository.findById` retrieves order items and their products without filtering `deletedAt`.
- **Location:** `apps/server/src/modules/orders/orders.repository.ts:48-61`
- **Code:**
  ```ts
  findById(id: string): Promise<OrderWithItems | undefined> {
    return db.query.orders.findFirst({
      where: and(eq(orders.id, id), isNull(orders.deletedAt)),
      with: {
        items: {
          with: {
            product: true,  // ❌ NO FILTER FOR DELETED PRODUCTS
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    }) as Promise<OrderWithItems | undefined>;
  }
  ```
- **Impact:** Users viewing past orders see products that have been deleted from the catalog. This violates soft-delete semantics (deleted = never existed).
- **Expected behavior:** Deleted products should either:
  - Option A: Be filtered out entirely (items with deleted products become invisible)
  - Option B: Be replaced with a placeholder (e.g., "Product removed")
  - Option C: Be explicitly marked as deleted in response
- **Decision needed:** What should happen when a user views an order containing a deleted product?
- **Action items:**
  - [ ] Decide on the above three options
  - [ ] Implement filtering or replacement logic
  - [ ] Add tests for deleted product handling
  - [ ] Update API response schema if needed

#### C-02: Events from Deleted Winemakers Appear in Listings
- **Area:** backend / database
- **Severity:** critical (data integrity)
- **Current state:** `eventsRepository.findMany` and `countMany` filter `isNull(events.deletedAt)` but do not check if the event's winemaker is deleted.
- **Location:** `apps/server/src/modules/events/events.repository.ts:63-93, 95-109`
- **Code:**
  ```ts
  findMany(filters: RepoFilters, pagination: { limit: number; offset: number }): Promise<EventWithDetails[]> {
    const conditions = [
      isNull(events.deletedAt),  // ✅ Event is not deleted
      eq(events.status, filters.status),
      // ❌ BUT: NO CHECK IF winemakers.deletedAt IS NULL
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);
    // ...
  }
  ```
- **Impact:** If a winemaker is deleted, their events still appear in the public listing. Users can see events from "deleted" accounts.
- **Cascade behavior:** Should deleting a winemaker also cascade-delete their events? Or should events remain with a null/archived winemaker reference?
- **Decision needed:** How should cascading deletes work? (This affects multiple modules.)
- **Action items:**
  - [ ] Add winemaker deletion check to `findMany` and `countMany`
  - [ ] Decide on cascade delete policy (winemaker deletion → event deletion?)
  - [ ] Apply same pattern to other modules (products, reviews, shops)

#### C-03: Duplicate Auth Routes (/login + /auth/login)
- **Area:** frontend / routing
- **Severity:** critical (user confusion + routing ambiguity)
- **Current state:** Both routes exist:
  - `apps/web/src/routes/login.tsx` → `/login`
  - `apps/web/src/routes/auth/login.tsx` → `/auth/login` (same functionality)
- **Location:** Route file structure
- **Impact:** Users can access the same page at two different URLs. This creates:
  - Confusion in bookmarks and links
  - Duplicate state management (different URL = different component mount)
  - SEO issues (duplicate content)
  - Testing ambiguity (which route is "correct"?)
- **Design decision:** The API design (`docs/API/api.md`) specifies `/auth/register` and `/auth/login`, suggesting the `/auth/` prefix is intentional. However, frontend routes don't match.
- **Action items:**
  - [ ] Decide: should auth routes be `/auth/login` or `/login`?
  - [ ] If `/auth/login`: delete the root-level `/login.tsx` and `/register.tsx`
  - [ ] If `/login`: update API docs to match or redirect `/auth/*` → `/*`
  - [ ] Update Header/navigation links to use single canonical URL
  - [ ] Add redirect middleware to enforce single URL

---

### P1 — Major

#### M-01: Inconsistent Soft-Delete Filtering Across Repositories
- **Area:** backend / database
- **Severity:** major (data integrity pattern violation)
- **Findings:**
  - ✅ `reviewsRepository` filters `isNull(deletedAt)` in all queries
  - ✅ `cartsRepository` filters deleted products in `findByIdWithItems`
  - ✅ `eventsRepository` filters `isNull(events.deletedAt)` in listings
  - ❌ `ordersRepository.findById` does NOT filter product deletedAt
  - ❌ `ordersRepository.listForShop` does NOT filter product deletedAt
  - ❌ `eventsRepository.findMany` does NOT filter winemaker deletedAt
  - ❌ Other modules not yet audited
- **Root cause:** Soft-delete filtering was implemented inconsistently as features were added
- **Impact:** Some modules expose deleted data; others hide it. No consistent policy.
- **Decision needed:** Should all relations be filtered recursively? Or only the primary entity?
- **Action items:**
  - [ ] Audit all repositories for soft-delete filtering consistency
  - [ ] Create a utility function for filtered relation queries
  - [ ] Document soft-delete policy in architecture.md

#### M-02: Event Registration Does Not Check Winemaker Deletion
- **Area:** backend / business logic
- **Severity:** major (data integrity)
- **Current state:** Users can register for events whose winemaker has been deleted.
- **Location:** `apps/server/src/modules/events/events.routes.ts` (event registration flow)
- **Decision needed:** Should registration be blocked if the winemaker is deleted?
- **Action items:**
  - [ ] Add check in event service layer: if event.winemaker.deletedAt is not null, return 404 or 410
  - [ ] Decide if deleting a winemaker should cascade-delete their event registrations

#### M-03: API Role Field Ambiguity
- **Area:** backend / schema
- **Severity:** major (frontend consistency)
- **Current state:** 
  - Database schema: `users` table has singular `role` field ("user" | "admin")
  - API documentation: Role-Permission Matrix suggests users can have multiple roles (e.g., Customer + Winemaker)
  - Generated API: `GetUsersMe200` returns single `role` string
- **Impact:** Frontend expects multiple roles but API returns single role. The role-based UI filtering (switch between winemaker/shop owner/customer) relies on multi-role support.
- **Design issue:** The system was designed for multiple roles, but schema was simplified to single role.
- **Decision needed:** Should users have:
  - Option A: Single role with inheritance (Customer → Winemaker upgrades)
  - Option B: Multiple roles simultaneously (Customer can also be Winemaker + Shop Owner)
  - Option C: Role history (current role + previous roles)
- **Impact:** This is a fundamental design decision that affects RBAC throughout the system.
- **Action items:**
  - [ ] Review role-permission matrix against current schema
  - [ ] Decide on role model (single vs. multiple)
  - [ ] If multiple roles: add `roles` array to users table and regenerate API
  - [ ] If single role: update role-permission matrix to reflect inheritance model

---

### P2 — Minor

#### L-01: Cascade Delete Policy Undefined
- **Area:** database / architecture
- **Severity:** minor (design clarity)
- **Findings:**
  - When a user is deleted, what happens to their orders? Reviews? Events?
  - When a winemaker is deleted, what happens to their wines and events?
  - When a shop is deleted, what happens to its products and orders?
- **Current state:** No documented cascade policy. Implementation varies by module.
- **Expected state:** Architecture.md should specify soft-delete + cascade behavior.
- **Action items:**
  - [ ] Document cascade delete policy
  - [ ] Audit each table for appropriate cascades
  - [ ] Implement cascades via migrations

#### L-02: Error Handling Inconsistency
- **Area:** backend / error handling
- **Severity:** minor (API consistency)
- **Current state:** 100+ `throw new Error("CODE")` statements across backend. No standardized error format.
- **Examples:**
  ```ts
  // Different error patterns in same codebase
  throw new Error("Product review insert returned no rows");
  throw new Error("ALREADY_REGISTERED");
  throw new Error("CAPACITY_FULL");
  throw new Error("Failed to create order");
  ```
- **Impact:** 
  - Client cannot programmatically differentiate errors
  - Error messages are English text, not error codes
  - Different modules use different conventions
- **Expected state:** Standardized error codes (e.g., `E_VALIDATION`, `E_CAPACITY_FULL`)
- **Action items:**
  - [ ] Create `AppError` class with error codes
  - [ ] Audit and update all error throws
  - [ ] Document error code reference

#### L-03: Guest Session Cleanup Not Triggered
- **Area:** backend / maintenance
- **Severity:** minor (database bloat)
- **Current state:** `guest-sessions.repository.ts` has a `cleanupExpired()` method stub with delete commented out.
- **Impact:** Expired guest sessions accumulate in the database indefinitely.
- **Action items:**
  - [ ] Implement cleanup logic
  - [ ] Add admin route or startup hook to trigger cleanup
  - [ ] Consider background task or cron job

#### L-04: Frontend Routes Missing Implementation
- **Area:** frontend / routing
- **Severity:** minor (incomplete MVP)
- **Findings:**
  - Routes stub out to `<RouteStub />` placeholder
  - Examples: `/explore`, `/search`, `/cart`, `/events`
- **Impact:** These public pages don't load actual content yet.
- **Action items:**
  - [ ] Implement missing route components
  - [ ] Connect to generated API hooks

#### L-05: Schema Documentation Incomplete
- **Area:** documentation
- **Severity:** minor (developer friction)
- **Current state:** `docs/dbdiagram_schema.dbml` is outdated (created in early design phase).
- **Expected state:** Should reflect current schema with all soft-delete fields and relations.
- **Action items:**
  - [ ] Regenerate or update DBML from current schema
  - [ ] Add descriptions for each table
  - [ ] Document foreign key relationships

---

## Design Opportunities (Redesign Candidates)

### D-01: Standardize Soft-Delete Pattern
**Current state:** Soft-delete implemented inconsistently across modules.

**Opportunity:** Create a reusable pattern:
- All entities support soft delete via `deletedAt: timestamptz`
- All repository queries filter `isNull(deletedAt)` by default
- Explicit `includeDeleted` option for admin operations
- Cascade delete behavior documented per table

**Benefit:** Eliminates data integrity bugs, improves consistency.

---

### D-02: Redesign Error Handling
**Current state:** 100+ error throws with mixed formats and messages.

**Opportunity:** Implement standardized error classes:
```ts
class AppError extends Error {
  code: string;          // e.g., "VALIDATION_ERROR"
  statusCode: number;    // e.g., 400
  details?: unknown;     // Additional context
}
```

**Benefit:** Better client error handling, clearer API contracts, easier debugging.

---

### D-03: Clarify Role Model
**Current state:** Design assumes multi-role, implementation has single-role schema.

**Opportunity 1 — Keep Single Role with Inheritance:**
```
User.role: "customer" | "winemaker" | "shop_owner" | "admin"
// Customer is the base role, upgradeable to winemaker/shop_owner
// Admin is special (overrides everything)
```
Pros: Simple schema, easy to query.
Cons: User cannot be both winemaker and shop_owner simultaneously.

**Opportunity 2 — Multiple Roles:**
```ts
User.roles: string[];  // ["customer", "winemaker", "shop_owner"]
// Requires separate `user_roles` junction table or JSON array
```
Pros: Flexible, matches business requirements (user can run wine business and shop).
Cons: More complex schema, harder to query, needs redesign of RBAC checks.

**Recommendation:** Review PRD and team consensus on whether a single user should be able to be both winemaker AND shop_owner simultaneously.

---

### D-04: Frontend Route Architecture Redesign
**Current state:** 
- Auth routes duplicated at `/login` and `/auth/login`
- Layout components scattered across multiple files
- No clear public/authenticated boundary

**Opportunity:** Reorganize routes for clarity:
```
routes/
├── (public)/
│   ├── login.tsx
│   ├── register.tsx
│   └── explore.tsx
├── (authenticated)/
│   ├── dashboard.tsx
│   ├── orders.tsx
│   └── (admin)/
│       ├── users.tsx
│       └── moderation.tsx
└── __root.tsx
```

**Benefit:** 
- Clear public/authenticated separation
- Single canonical auth routes
- Easier to add route guards

---

### D-05: Database Constraint Strategy
**Current state:** Foreign keys exist but no check constraints for business rules.

**Opportunity:** Add constraints for:
- Order.totalPrice must equal sum of item prices
- Event.capacity must be > 0
- Product.price must be > 0
- Cart items must reference products that exist

**Benefit:** Database-level data integrity, catches bugs before ORM layer.

---

## Documentation Consistency Findings

### ✅ CONSISTENT
- Role-Permission Matrix (`docs/ROLES/roles.md`) — Comprehensive, up-to-date
- Technology Stack (`docs/TECHSTACK/techstack.md`) — Accurate
- Backend Module Structure (`docs/ARCHITECTURE/architecture.md`) — Clear

### ❌ INCONSISTENT
- **Frontend Routes** — Documentation lists routes that don't match actual file structure
- **API Specification** (`docs/API/api.md`) — References `/auth/*` routes but frontend has duplication
- **Database Schema** — DBML diagram is stale; doesn't reflect current migrations

### 📋 MISSING
- Cascade delete policy
- Soft-delete filtering rules
- Error code reference
- Guest session cleanup implementation guide

---

## Action Priority

### Blocking (fix before merging next features)
1. **C-01** — Filter deleted products from order queries
2. **C-02** — Filter deleted winemakers from event listings
3. **C-03** — Remove duplicate auth routes
4. **M-03** — Clarify role model vs. schema mismatch

### Next Sprint
5. **M-01** — Standardize soft-delete checking across all repositories
6. **M-02** — Add winemaker deletion check to event operations
7. **L-01** — Document cascade delete policy

### Polish (can defer)
8. **L-02** — Standardize error handling
9. **L-03** — Implement guest session cleanup
10. **L-04** — Complete frontend route implementations
11. **L-05** — Update schema documentation

---

## Decisions Required from Team

| # | Decision | Options | Impact |
|---|----------|---------|--------|
| D1 | Deleted product in order — hide, placeholder, or flag? | A: Filter out B: Placeholder C: Flag in response | C-01 resolution |
| D2 | Cascade delete policy | Per-table decisions needed | C-02 + M-02 resolution |
| D3 | Role model — single or multiple? | Single inheritance vs. Multiple simultaneous | M-03 resolution + major schema change |
| D4 | Auth routes — /login or /auth/login? | Align with API design | C-03 resolution |
| D5 | Soft-delete utility pattern | Create helpers vs. case-by-case | M-01 resolution |

---

## Outstanding Technical Debt

| Item | Severity | Effort | Blocker? |
|------|----------|--------|----------|
| Order product deletion handling | Critical | 1-2 hours | YES |
| Event winemaker deletion check | Critical | 30 min | YES |
| Duplicate auth routes | Critical | 30 min | YES |
| Role model clarification | Major | 2-4 hours | YES (for RBAC features) |
| Soft-delete consistency audit | Major | 2-3 hours | NO (can parallelize) |
| Error handling refactor | Minor | 3-4 hours | NO |
| Schema documentation | Minor | 1-2 hours | NO |

---

## Revision History

- **2026-04-26 (evening)** — Comprehensive audit after merging all doc branches. Identified critical issues and design opportunities.

