# E2E Role Happy Paths — Design Spec

**Date:** 2026-06-18
**Status:** Approved
**Author:** Brainstorming session

---

## Problem

The existing E2E suite (122 tests across 15 specs) covers public browsing, catalog navigation, basic CRUD, RBAC negative tests, and ownership boundaries. What's missing are the _complete happy-path journeys_ each role takes through the app — the end-to-end flows that prove core functionality works: checkout, event registration, role requests, supply agreements, inventory management, admin moderation, and user-generated content CRUD.

---

## Goal

Add per-role happy-path E2E tests that verify the primary workflows for each actor:

1. **Customer** — role request, checkout, event registration, review CRUD, comment, profile, address
2. **Winemaker** — profile CRUD, wine creation with images, event creation, supply agreement acceptance
3. **Shop owner** — shop edit, inventory add/edit, supply request, availability, bundles, orders
4. **Admin** — user suspend/unsuspend, role request approve/reject, review moderation, admin stats

---

## Constraints

- **Data strategy:** Shared seeded demo data (same as existing suite). No per-test cleanup.
- **Auth strategy:** `authenticateUser()` (all-roles) for winemaker/shop-owner/admin flows; `authenticateAsCustomer()` for customer-only flows.
- **Parallelism:** Each spec file must be safe to run in any CI shard.
- **Resilience:** Use the same resilient assertion pattern established in the existing suite — accept guard redirects, accept form validation stay-on-page, verify sign-in succeeded before proceeding.

---

## File structure

```
apps/web/src/__tests__/e2e/
  customer-happy-paths.spec.ts    ← NEW
  winemaker-happy-paths.spec.ts   ← NEW
  shop-owner-happy-paths.spec.ts  ← NEW
  admin-happy-paths.spec.ts       ← NEW
```

All other existing specs unchanged.

---

## Spec: `customer-happy-paths.spec.ts`

**Fixture:** `authenticateAsCustomer` (email: `e2e-customer@gzeos.com`, role: `customer`)
**Seed needs:** products, events, reviews (all exist in demo seed)

| # | Test | Steps | Assert |
|---|------|-------|--------|
| 1 | Request a new role | Sign in → navigate to role request page → fill form (select "winemaker") → submit | Success message or redirect; request appears in "my requests" or page shows confirmation |
| 2 | Checkout flow | Sign in → add product to cart → go to checkout → fill shipping address form → place order | URL is `/checkout` or `/orders`; order confirmation visible |
| 3 | Register for event | Sign in → browse events → click into event → click "Register" | Button changes to "Registered" or confirmation text shown |
| 4 | Write a review | Sign in → go to product detail → fill star rating + text → submit | New review appears in list with user's identifier |
| 5 | Edit own review | Sign in → go to review they wrote → click edit → change text → save | Updated text visible on page |
| 6 | Write comment on event | Sign in → go to event detail → write comment → submit | Comment appears in comment list |
| 7 | Edit profile | Sign in → go to settings → change name → save | Updated name shown in nav/user menu or settings page |
| 8 | Add address | Sign in → go to addresses → add new address → save | New address appears in address list |

---

## Spec: `winemaker-happy-paths.spec.ts`

**Fixture:** `authenticateUser` (all-roles, owns `lavicka` winemaker)
**Seed IDs used:** TEST_WINEMAKER_ID, TEST_WINE_ID, TEST_EVENT_ID

| # | Test | Steps | Assert |
|---|------|-------|--------|
| 1 | View my winemaker profile | Sign in → go to my winemaker detail page | Shows winemaker name, region, description; "Manage" button visible (user is owner) |
| 2 | Edit my winemaker profile | Sign in → go to my winemaker edit → change description → save | Updated description visible on detail page |
| 3 | View my wines | Sign in → navigate to wines with filter/section for owned wines | Only wines belonging to test winemaker shown (or filter active) |
| 4 | Create wine with full details | Sign in → `/wines/new` → fill name, region, type, vintage, alcohol, description → submit | Redirected to detail; submitted data visible |
| 5 | Upload wine image | Sign in → go to wine images page → upload an image file (use a small test image from disk) | Image preview or thumbnail appears after upload |
| 6 | Create event | Sign in → `/events/new` → fill title, description, date, location → submit | Event detail page shows submitted data |
| 7 | View supply agreements | Sign in → go to supply agreements / incoming requests page | List renders (may be empty — acceptable) |
| 8 | Accept supply agreement | Sign in → go to supply agreements / incoming requests → if pending agreements exist, click accept on the first one | Agreement status updates; if no pending agreements, page renders empty state (both valid) |

---

## Spec: `shop-owner-happy-paths.spec.ts`

**Fixture:** `authenticateUser` (all-roles, owns `wine_enjoyers` shop)
**Seed IDs used:** TEST_SHOP_ID

| # | Test | Steps | Assert |
|---|------|-------|--------|
| 1 | View my shop | Sign in → go to my shop detail | Shop name, description, products section visible; "Manage" menu present |
| 2 | Edit my shop | Sign in → go to my shop edit → change description → save | Updated description on detail page |
| 3 | Add product to inventory | Sign in → `/shops/$id/inventory/new` → fill name, price, select wine from supply → submit | New product row appears in inventory list |
| 4 | Edit inventory product price | Sign in → inventory list → click edit on first product → change price → save | Updated price visible in inventory list |
| 5 | Request supply from winemaker | Sign in → supply-browse → click a winemaker → click "Request supply" → fill details → submit | Success message; request appears in outgoing or status list |
| 6 | Add availability hours | Sign in → availability page → add regular hours (day + open/close time) → save | New hours row visible on page |
| 7 | Create a bundle | Sign in → bundles/new → fill name + description + select products → submit | Redirected; bundle visible on shop page |
| 8 | View shop orders | Sign in → shop orders page → click into an order | Order detail with items, status, customer address visible |

---

## Spec: `admin-happy-paths.spec.ts`

**Fixture:** `authenticateUser` (all-roles, has `admin` in Clerk metadata and DB)
**Seed needs:** Pending role request, review to delete, user to suspend

| # | Test | Steps | Assert |
|---|------|-------|--------|
| 1 | View user list with search | Sign in → `/users` → type in search box | Table filters results; user rows visible |
| 2 | View user detail | Sign in → users list → click a user → see detail | User info card with email, roles, status visible |
| 3 | Suspend a user | Sign in → users list → open action menu on a known user → click "Suspend" → confirm | Status badge changes to "suspended" or success message |
| 4 | Unsuspend a user | Sign in → find the user suspended in previous step → action menu → "Unsuspend" → confirm | Status badge changes back to "active" |
| 5 | Approve role request | Sign in → role requests list → click "Approve" on a pending request → confirm | Request moves to approved or disappears from pending |
| 6 | Reject role request | Sign in → role requests list → click "Reject" on another pending request → confirm | Request moves to rejected or disappears from pending |
| 7 | Delete a review | Sign in → moderation panel → find a review → click delete → confirm | Review removed from list |
| 8 | View admin stats | Sign in → `/stats` → observe admin-specific metrics | Stats cards with user counts, revenue, or other admin-level data visible |

---

## Seed preconditions

All needed data exists in the demo seed after running `bun run db:seed:demo`:

- **Customer-happy-paths:** Products, events, reviews already seeded. The customer user has no winemaker profile yet (clean state for role request).
- **Winemaker-happy-paths:** Test user owns `lavicka` winemaker (TEST_WINEMAKER_ID). Wines (TEST_WINE_ID) and events (TEST_EVENT_ID) exist.
- **Shop-owner-happy-paths:** Test user owns `wine_enjoyers` shop (TEST_SHOP_ID). Products exist in inventory. Winemakers with supply exist.
- **Admin-happy-paths:** Role requests are seeded (5 in demo seed). Reviews exist for moderation. Multiple users exist for suspend/unsuspend.

No seed changes required.

---

## Implementation notes

- Selectors: Use `data-slot` attributes (e.g., `[data-slot="catalog-card"]`, `[data-slot="card"]`) following the pattern established in the existing suite.
- URL patterns: Accept UUID-based IDs (`[\w-]+` not `\d+`).
- Form submissions: Use `getByLabel()` for form fields, `getByRole("button", { name: ... })` for submit buttons.
- Resilience: After `authenticateUser()`, wait for profile load (`waitForTimeout` or `waitForLoadState`). Accept redirects on admin-guarded routes.
- File upload: Include a small test image in the test fixtures directory (e.g., `apps/web/src/__tests__/e2e/fixtures/test-image.png`).
- Destructive tests: Tests 3-4 (suspend/unsuspend) and 5-6 (approve/reject) should operate on known seeded entities, not the test user themselves. Use specific seeded user IDs or pick from list entries.
