# E2E Flow Coverage — Design Spec

**Date:** 2026-06-18  
**Status:** Approved  
**Author:** Matěj Šinogl (via brainstorming session)

---

## Problem

Current E2E tests (`role-flows.spec.ts`, `auth-redirects.spec.ts`) are pure navigation checks:  
`goto(url) → waitForLoadState → expect(url).toContain(path)`.  
They prove routing works. They do not prove features work.

---

## Goal

Add E2E tests that verify:
1. **Interaction flows** — clicks, form fills, UI state changes after user actions
2. **CRUD flows** — create/edit operations land on the right page and show persisted data
3. **Role-based access control** — each role can reach what it should and is blocked from what it shouldn't
4. **Ownership boundaries** — users cannot edit resources owned by other users

---

## Constraints

- **Data strategy:** Shared seeded data, no per-test cleanup. Tests use known entity IDs from seed.
- **Auth strategy:** Existing `authenticateUser()` fixture (all-roles user). Three new per-role fixtures added alongside it.
- **Parallelism:** Tests already shard across 3 runners. Each spec file must be safe to run in any shard.

---

## Test users

### Existing
| Variable | Email | Roles | Purpose |
|---|---|---|---|
| `TEST_USER_EMAIL` | `palahap384@gzeos.com` | all | Positive CRUD, interaction, ownership boundary tests |

### New (to create in Clerk dev, add to `apps/server/.env.local`)
| Variable | Suggested email | Roles | Purpose |
|---|---|---|---|
| `TEST_USER_CUSTOMER_EMAIL` | `e2e-customer@winemarket.test` | `customer` only | RBAC negative tests for customer role |
| `TEST_USER_WINEMAKER_EMAIL` | `e2e-winemaker@winemarket.test` | `winemaker` only | RBAC negative tests for winemaker role |
| `TEST_USER_SHOP_OWNER_EMAIL` | `e2e-shopowner@winemarket.test` | `shop_owner` only | RBAC negative tests for shop owner role |

Passwords for each also added to `.env.local` as `TEST_USER_CUSTOMER_PASSWORD` etc.

### Fixture additions (`apps/web/playwright.fixtures.ts`)
```ts
authenticateUser()         // existing — all roles
authenticateAsCustomer()   // new — customer only
authenticateAsWinemaker()  // new — winemaker only
authenticateAsShopOwner()  // new — shop owner only
```

---

## Seed requirement

The all-roles test user currently has only `admin` and `customer` roles in the DB seed (`seed.demo.ts`). The following must be added to `seed.demo.ts` so CRUD and ownership boundary tests have a stable anchor:

1. **Owned winemaker profile** — test user is the owner of a specific winemaker row (e.g., designated key `"test_winemaker"`). The resulting ID is exposed as `TEST_WINEMAKER_ID` in `.env.local` after seeding.
2. **Owned shop** — test user is the owner of a specific shop row (e.g., key `"test_shop"`). Exposed as `TEST_SHOP_ID`.
3. **At least one wine** belonging to the test winemaker — exposed as `TEST_WINE_ID`.
4. **At least one event** created by the test winemaker — exposed as `TEST_EVENT_ID`.
5. **Winemaker 2 and Shop 2** must NOT be owned by the test user (already true from seed structure).

> Until this seed work is done, wine-crud, shop-management, and ownership-boundaries specs must be marked `.skip` and un-skipped once seeding is in place.

---

## File structure

```
apps/web/src/__tests__/e2e/
  auth-redirects.spec.ts        ← existing, unchanged
  role-flows.spec.ts            ← existing, navigation smoke
  cart-checkout.spec.ts         ← NEW
  catalog-search.spec.ts        ← NEW
  wine-crud.spec.ts             ← NEW (requires seed work)
  shop-management.spec.ts       ← NEW (requires seed work)
  events.spec.ts                ← NEW
  orders.spec.ts                ← NEW
  reviews.spec.ts               ← NEW
  dashboard.spec.ts             ← NEW
  admin-flows.spec.ts           ← NEW
  rbac-negative.spec.ts         ← NEW (requires 3 new test users)
  ownership-boundaries.spec.ts  ← NEW (requires seed work)
```

---

## Flows per file

### `cart-checkout.spec.ts`
All tests run as guest (unauthenticated) except checkout.

| Test | Steps | Assert |
|---|---|---|
| Add product to cart | goto `/products/1`, click "Add to cart" | Cart count in nav increments |
| Change quantity | In cart, increment quantity control | Line total updates |
| Remove item | In cart, click remove | Empty cart state shown |
| Cart persists on refresh | Add item, reload page | Item still in cart |
| Checkout flow | authenticateUser, fill address form, submit | URL is `/checkout/confirmed`, order number visible |

---

### `catalog-search.spec.ts`
All tests run as guest.

| Test | Steps | Assert |
|---|---|---|
| Search returns results | goto `/search?q=wine` | At least one result card visible |
| Wine filter by winemaker | goto `/wines`, select winemaker filter | URL updates, card count changes |
| Product filter by shop | goto `/products`, select shop filter | Results change |
| Wine detail renders | goto `/wines/1` | Heading with wine name, description text, image visible |
| Product detail renders | goto `/products/1` | Name, price, shop name visible |
| Shop detail renders | goto `/shops/1` | Shop name, opening hours section, products list visible |
| Winemaker detail renders | goto `/winemakers/1` | Name, wines section, events section visible |
| Event detail renders | goto `/events/1` | Title, description, registration button visible |

---

### `wine-crud.spec.ts`
Requires `TEST_WINE_ID` and owned winemaker in seed. Uses `authenticateUser`.

| Test | Steps | Assert |
|---|---|---|
| Create wine | goto `/wines/new`, fill name + region + description, submit | Redirected to detail page, heading matches submitted name |
| Edit wine | goto `/wines/{TEST_WINE_ID}/edit`, change description, save | Updated description visible on detail page |
| Wine images page renders | goto `/wines/{TEST_WINE_ID}/images` | Upload UI (dropzone or file input) present |

---

### `shop-management.spec.ts`
Requires `TEST_SHOP_ID` in seed. Uses `authenticateUser`.

| Test | Steps | Assert |
|---|---|---|
| Inventory list | goto `/shops/{TEST_SHOP_ID}/inventory` | Product rows render |
| Add inventory item | goto `/shops/{TEST_SHOP_ID}/inventory/new`, fill form, submit | New item appears in inventory list |
| Edit inventory item | goto first inventory item edit page, change price, save | Updated price visible in list |
| Shop orders | goto `/shops/{TEST_SHOP_ID}/orders` | Orders table renders with at least one row |
| Supply browse | goto `/shops/{TEST_SHOP_ID}/supply-browse` | Winemaker supply cards visible |
| Create bundle | goto `/shops/{TEST_SHOP_ID}/bundles/new`, fill form, submit | Redirected, bundle visible |
| Shop availability | goto `/shops/{TEST_SHOP_ID}/availability` | Schedule/hours UI renders |

---

### `events.spec.ts`
Uses `authenticateUser` for protected actions.

| Test | Steps | Assert |
|---|---|---|
| Events list renders | goto `/events` | At least one event card visible |
| Event detail renders | goto `/events/1` | Hero, title, date, registration button visible |
| Register for event | goto `/events/1`, click Register | Button state changes / confirmation shown |
| Create event | goto `/events/new`, fill title + description + date, submit | Redirected to event detail, title matches |
| Edit event | goto `/events/{TEST_EVENT_ID}/edit`, change title, save | Updated title on detail page |

---

### `orders.spec.ts`
Uses `authenticateUser`.

| Test | Steps | Assert |
|---|---|---|
| Orders list | goto `/orders` | At least one order row visible |
| Order detail | goto `/orders/1` | Order items table, status, total, delivery address visible |

---

### `reviews.spec.ts`
Uses `authenticateUser`.

| Test | Steps | Assert |
|---|---|---|
| Product reviews visible | goto `/products/1` | Reviews section present |
| Write product review | Fill star rating + body text, submit | New review appears in list |
| Winemaker reviews visible | goto `/winemakers/1` | Reviews section with at least one review |

---

### `dashboard.spec.ts`
Tests role-specific content. Uses all four test users.

| Test | User | Assert |
|---|---|---|
| All-roles sees all sections | authenticateUser | Winemaker widget + shop widget + customer widget all visible |
| Customer sees customer section only | authenticateAsCustomer | Customer orders widget visible; wine management section absent |
| Winemaker sees winemaker section | authenticateAsWinemaker | Wines widget visible; shop inventory section absent |
| Shop owner sees shop section | authenticateAsShopOwner | Shop management widget visible; wine creation link absent |

---

### `admin-flows.spec.ts`
Uses `authenticateUser`.

| Test | Steps | Assert |
|---|---|---|
| Users list | goto `/admin/users` | User rows render, search input present |
| User detail | goto `/admin/users/1` | User info card renders |
| Role requests list | goto `/admin/role-requests` | Table renders |
| Moderation panel | goto `/admin/moderation` | Content renders |

---

### `rbac-negative.spec.ts`
Each test uses a single-role user. All expect a redirect away from the route (not `/auth/login` — user IS authenticated — but away to dashboard or a 403 page).

| Test | User | Route | Expected |
|---|---|---|---|
| Customer cannot create wine | `authenticateAsCustomer` | `/wines/new` | Redirected away |
| Customer cannot create event | `authenticateAsCustomer` | `/events/new` | Redirected away |
| Customer cannot access shop inventory | `authenticateAsCustomer` | `/shops/1/inventory` | Redirected away |
| Customer cannot access admin | `authenticateAsCustomer` | `/admin/users` | Redirected away |
| Winemaker cannot access shop inventory | `authenticateAsWinemaker` | `/shops/1/inventory` | Redirected away |
| Winemaker cannot create shop | `authenticateAsWinemaker` | `/shops/new` | Redirected away |
| Winemaker cannot access admin | `authenticateAsWinemaker` | `/admin/users` | Redirected away |
| Shop owner cannot create wine | `authenticateAsShopOwner` | `/wines/new` | Redirected away |
| Shop owner cannot create event | `authenticateAsShopOwner` | `/events/new` | Redirected away |
| Shop owner cannot access admin | `authenticateAsShopOwner` | `/admin/users` | Redirected away |

> **Note:** "Redirected away" means `page.url()` does not contain the requested path after `waitForLoadState`. The exact redirect target (dashboard, home, 403) depends on the frontend guard implementation.

---

### `ownership-boundaries.spec.ts`
Uses `authenticateUser` (all-roles). Assumes test user owns `TEST_WINEMAKER_ID` and `TEST_SHOP_ID` but does NOT own winemaker 2 / shop 2.

| Test | Seeded assumption | Assert |
|---|---|---|
| Edit button absent on unowned wine | Wine ID from winemaker 2 | Edit button not in DOM on detail page |
| Cannot navigate to unowned wine edit | Wine ID from winemaker 2 | `/wines/{id}/edit` redirects away |
| Edit button absent on unowned shop | Shop ID 2 owned by different user | Edit button not in DOM on shop detail |
| Cannot access unowned shop inventory | Shop ID 2 | `/shops/2/inventory` redirects away |
| Cannot access unowned shop orders | Shop ID 2 | `/shops/2/orders` redirects away |
| Edit button absent on unowned event | Event from winemaker 2 | Edit button not in DOM on event detail |

---

## Shard distribution (approximate)

With 3 CI shards and ~100 tests total across all files, Playwright distributes automatically. No manual shard assignment needed — the matrix strategy in CI handles it.

---

## Implementation order

1. **Fixture expansion** — add 3 new `authenticate*` helpers (unblocks rbac-negative, dashboard tests)
2. **Seed extension** — add test user's winemaker + shop + owned content (unblocks wine-crud, shop-management, ownership-boundaries)
3. **New spec files** — implement in order: cart-checkout → catalog-search → events → orders → reviews → dashboard → admin-flows → rbac-negative → ownership-boundaries → wine-crud → shop-management
4. **Skip guards** — wine-crud, shop-management, ownership-boundaries start `.skip`; remove skip after seed work lands
