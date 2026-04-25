# Audit — Full Architecture (2026-04-24)

## Meta
- **Date:** 2026-04-24
- **Auditor:** Matěj Šinogl + Claude
- **Scope:** Entire codebase vs. design documents, course standards (seminars + sample projects), and agreed team conventions
- **Status:** ✅ CLOSED (Resolved)

## Summary

All critical, major, and minor findings identified in the audit have been addressed. The system now features a consistent and scalable role system (`roles: AppRole[]`), a robust frontend route tree with pathless layout guards, server-side anonymous guest sessions with cart merging, and enforced wine allocation logic. All documentation has been updated to match the final implementation.

---

## Findings

---

### F-01: Auth module does not follow the standard module pattern
- **Status:** ✅ resolved (intentional divergence, documented)

### F-02: Role representation is inconsistent and does not scale
- **Status:** ✅ resolved
- **Resolution:** Implemented `roles: AppRole[]` throughout the stack. Clerk JWT template updated. `authPlugin` macros and frontend guards migrated. `Users.role` column dropped.

### F-03: Frontend routes are flat with no auth guards
- **Status:** ✅ resolved
- **Resolution:** Restructured to pathless layout tree with `_authenticated`, `_admin`, `_shop_owner`, and `_winemaker` guards.

### F-04: Guest cart is documented as localStorage but team decided server-side sessions
- **Status:** ✅ resolved
- **Resolution:** Implemented `guest_sessions` table and backend module. Updated `carts` and `orders` to support server-side guest state. Added cart merging on login.

### F-05: Domain model — winemakers are B2B suppliers, not B2C retailers
- **Status:** ✅ resolved
- **Resolution:** Clarified roles in docs. Winemakers manage production catalog and supply agreements; Shop owners manage retail inventory and bundles.

### F-05b: `supply-agreements` module does not exist yet
- **Status:** ✅ resolved
- **Resolution:** Created full `supply-agreements` module with repository, service, and routes.

### F-06: Private `-components/` and `-hooks/` pattern not implemented in frontend
- **Status:** ✅ resolved
- **Resolution:** Pattern enforced for all new routes created during restructuring.

### F-07: `UserContext` couples auth state to the `/users/me` API call unconditionally
- **Status:** ✅ resolved
- **Resolution:** `UserContext` now only calls `/users/me` when authenticated. `useRoles()` hook created for RBAC.

### F-08: Toolchain — Kubb replaced by Orval
- **Status:** ✅ resolved

### F-09: OpenAPI spec normalizer required due to Zod v4 quirks
- **Status:** ✅ resolved

### F-10: `docs/ARCHITECTURE/architecture.md` references Kubb, not Orval
- **Status:** ✅ resolved

### F-11: `Users.role` column in DB is redundant once roles live in Clerk
- **Status:** ✅ resolved
- **Resolution:** Column dropped via migration.

### F-12: `authPlugin` has code duplication across three macros
- **Status:** ✅ resolved
- **Resolution:** Macros consolidated into two clean endpoints.

### F-13: `lazyGetOrCreate` in `users.service.ts` syncs role to DB — unnecessary after F-02
- **Status:** ✅ resolved
- **Resolution:** Role syncing removed; now sets Clerk metadata on first login.

### F-14: `/checkout` is listed as customer-only but guest checkout is now required
- **Status:** ✅ resolved
- **Resolution:** Guest checkout implemented and documented.

### F-15: `shops.ownerUserId` has `.unique()` — blocks multiple shops per user
- **Status:** ✅ resolved
- **Resolution:** Removed `.unique()`. Nested shop routes under `/shops/:shopId/`.

### F-16: `wines.quantity` is producer distributable stock — needs allocation enforcement
- **Status:** ✅ resolved
- **Resolution:** `productsRepository` now enforces atomic allocation and decrement of winemaker stock.

### F-20: Update `docs/notes.md` to reflect guest cart decision change
- **Status:** ✅ resolved

---

## Decisions Log

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | Replace booleans with `roles: AppRole[]` | Scalable RBAC | ✅ done |
| D-02 | Pathless layout tree for routes | Idiomatic TanStack Router guards | ✅ done |
| D-03 | Server-side anonymous sessions | Better state persistence and order creation | ✅ done |
| D-04 | Separate Winemaker (B2B) vs Shop (B2C) | Domain model clarity | ✅ done |
| D-04b| New `supply-agreements` module | Manage B2B relationships | ✅ done |
| D-07 | Winemaker stock allocation logic | Enforce supply chain integrity | ✅ done |
| D-08 | Multiple shops per user | Route-based nesting (`/shops/:id`) | ✅ done |
| D-05 | Decouple profile data from roles | Performance and clean separation | ✅ done |
| D-06 | Move to Orval for API hooks | Better stability and output quality | ✅ done |

---

## Revision History

- **2026-04-25** — Audit closed; all findings resolved.
- **2026-04-24** — Initial audit created (Matěj + Claude)
