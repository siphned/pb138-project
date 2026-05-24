# WINE-71 — Cart + Orders/Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish `/cart` (mostly wired already) and replace stubs on `/checkout/confirmed`, `/orders`, `/orders/$id` with real UI using cascade pattern and WINE-187 primitives. The cart route already has real-data implementation from earlier work — migrate it to primitives rather than rewrite.

**Architecture:** Same cascade pattern. New domain components in `apps/web/src/components/orders/` (new folder). Existing cart-specific components in `routes/-components/cart/` get audited and partially moved to `components/cart/`.

**Tech Stack:** Same as WINE-68.

**Predecessor:** WINE-187 merged.

---

## Hard rules

Identical to WINE-68 §"Hard rules". Conventional commit prefix here: `feat(WINE-71):` / `refactor(WINE-71):` / `chore(WINE-71):`.

**Special note:** `/cart` is NOT a stub on dev — it has real implementation already. Treat it as an audit-and-migrate target, not a greenfield route.

---

## 1. Branch bootstrap

```powershell
git fetch origin
git checkout WINE-71-build-shopping-cart-and-checkout-flow
git reset --hard origin/dev
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-71): bring in WINE-187 foundation primitives"
```

Sanity test + force-push.

---

## 2. Scope

**In:** `/cart` audit + migrate, `/checkout/confirmed`, `/orders`, `/orders/$id`.

**Out:** Payment integration (out of project scope — orders are placed without real payment). Shipping-rate calculation. Email receipts.

---

## 3. Architecture decisions

### 3.1 Existing cart components

In `apps/web/src/routes/-components/cart/`:
- `AddressForm.tsx` — used by cart AND dashboard (after WINE-59). Move to `components/forms/` so both routes import from the same place.
- `CartEmpty.tsx` — replace with `<EmptyState>` primitive directly in the route.
- `CartItemRow.tsx` — keep, migrate violations.
- `CartSection.tsx` — keep.
- `CartSummary.tsx` — keep, migrate violations.
- `CheckoutSection.tsx` — keep, audit and likely migrate `<Section>` primitive wrapper.
- `DeliveryMethodToggle.tsx` — keep.
- `QuantityControl.tsx` — keep.

### 3.2 Orders domain components

New folder `components/orders/`:
- `OrderCard.tsx` — single order summary tile for the list page.
- `OrderItemRow.tsx` — one row of `orderItems` inside detail.
- `OrderStatusBadge.tsx` — colored badge per status (pending, preparing, shipped, delivered, canceled).
- `OrderTotalsBlock.tsx` — `<DescriptionList>` of subtotal + shipping + tax + total.

### 3.3 Confirmed page

`/checkout/confirmed?orderId=$id` reads the orderId from search params, fetches `useGetOrdersById`, renders:
- `<Card variant="section">` with check icon + "Order placed!" + order number
- `<OrderTotalsBlock>`
- `<DataGrid variant="list">` of `<OrderItemRow>`
- Back-to-shopping button → `/explore`
- "View order" button → `/orders/$id`

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/orders/OrderCard.tsx` | ~60 | Order summary card with status badge, total, item count, date, "View" link |
| `apps/web/src/components/orders/OrderItemRow.tsx` | ~50 | One line item — image, name, qty × price = subtotal |
| `apps/web/src/components/orders/OrderStatusBadge.tsx` | ~30 | Colored badge per status using shadcn `<Badge>` variants |
| `apps/web/src/components/orders/OrderTotalsBlock.tsx` | ~30 | `<DescriptionList>` of totals |
| `apps/web/src/components/orders/<name>.test.tsx` (4 files) | ~25 each | |
| `apps/web/src/components/forms/AddressForm.tsx` | (moved from cart/) | Shared address form |
| `apps/web/src/components/forms/AddressForm.test.tsx` | ~30 | If not already tested |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/cart.tsx` | Audit pass: swap inline skeletons to `<LoadingState>`, inline error to `<ErrorState>`, inline empty to `<EmptyState>`, `<Section>` heading wraps |
| `apps/web/src/routes/checkout.confirmed.tsx` | Replace stub with confirmed-page UI |
| `apps/web/src/routes/_authenticated.orders.tsx` | Replace stub with `<DataGrid variant="list">` of `<OrderCard>` from `useGetOrders` (or `useGetOrdersMe` — verify) |
| `apps/web/src/routes/_authenticated.orders.$id.tsx` | Replace stub with detail UI |

### 4.3 Delete / move

| Path | Action | Reason |
|---|---|---|
| `routes/-components/cart/AddressForm.tsx` | `git mv` → `components/forms/AddressForm.tsx` | Reused by dashboard (WINE-59) |
| `routes/-components/cart/CartEmpty.tsx` | DELETE | Replaced by `<EmptyState>` |

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2-5: Build 4 new orders domain components (TDD, one task each)

Standard TDD per WINE-68 Task 2 pattern. ≥3 tests per component. Commits: `feat(WINE-71): add OrderCard|OrderItemRow|OrderStatusBadge|OrderTotalsBlock component`.

### Task 6: Move `<AddressForm>` to `components/forms/`

`git mv routes/-components/cart/AddressForm.tsx apps/web/src/components/forms/AddressForm.tsx`. Update importers. Audit for violations. Add test if not present (≥4 tests). Commit: `refactor(WINE-71): move AddressForm to components/forms/ for reuse`.

### Task 7: Migrate `/cart` route — audit pass

Read the existing route. Identify violations (inline skeleton, inline error UI, hardcoded colors). Replace with primitives. Wrap sections in `<Section heading>`. Do NOT rewrite business logic; this is a styling/structure pass. Commit: `refactor(WINE-71): migrate /cart route to primitive layer`.

### Task 8: Delete `CartEmpty.tsx`

Replace its single usage in `/cart` with `<EmptyState message="Your cart is empty." action={<Button as={Link} to="/explore">Browse wines</Button>} />`. Commit: `chore(WINE-71): replace CartEmpty with EmptyState primitive`.

### Task 9: Migrate `/checkout/confirmed` route

Replace stub. Use `useGetOrdersById(orderId)` where orderId is from `Route.useSearch().orderId`. Render `<Card variant="section">` confirmation block + `<OrderTotalsBlock>` + `<DataGrid variant="list">` of `<OrderItemRow>`. Commit: `feat(WINE-71): migrate /checkout/confirmed to cascade pattern`.

### Task 10: Migrate `/orders` route

Replace stub. Fetch list (hook TBD — verify `useGetOrders` exists; if not, this route is BE-blocked, render `<ErrorState message="Orders list endpoint missing" />` and flag in §10). On success, render `<DataGrid variant="list">` of `<OrderCard>`. Empty state when zero orders. Commit: `feat(WINE-71): migrate /orders route to cascade pattern`.

### Task 11: Migrate `/orders/$id` route

Replace stub. Fetch `useGetOrdersById(id)`. Render:
- `<PageHeader title={`Order #${order.id.slice(0,8)}`} description={order.status} />`
- `<Section heading="Items">` `<DataGrid variant="list">` of `<OrderItemRow>`
- `<Section heading="Totals">` `<OrderTotalsBlock>`
- `<Section heading="Shipping address">` rendered address block (use a `<DescriptionList>`)

Commit: `feat(WINE-71): migrate /orders/$id route to cascade pattern`.

### Task 12: Audit kept cart components

For each of `CartItemRow`, `CartSection`, `CartSummary`, `CheckoutSection`, `DeliveryMethodToggle`, `QuantityControl`: migrate violations. Commit per file or one batch commit: `refactor(WINE-71): migrate kept cart components to primitive layer`.

### Task 13: Final verification

Manual sweep:
- `/cart` empty, with items, switching delivery methods, qty changes
- `/checkout/confirmed?orderId=…` with a real order id
- `/orders` as customer with orders, without orders
- `/orders/$id` with various statuses
- Dark mode parity

---

## 6. Per-route descriptions

### 6.1 `/cart` (audit-only, structure stays)

Current structure mostly correct. Goal: primitive parity.

### 6.2 `/checkout/confirmed`

- Big success block top: green check icon (`<HugeiconsIcon icon={Checkmark...Icon} />`), "Order placed!", order id badge
- `<OrderTotalsBlock>` and item summary
- Two CTA buttons: "View order" → `/orders/$id`, "Back to shopping" → `/explore`

### 6.3 `/orders`

- `<PageHeader title="Your orders" />`
- `<DataGrid variant="list">` of `<OrderCard>` ordered by `createdAt desc`
- `<EmptyState>` with "Browse wines" CTA

### 6.4 `/orders/$id`

- Back link → `/orders`
- `<PageHeader>` with order id + status badge
- `<Section heading="Items">` table-like list of items
- `<Section heading="Totals">` price breakdown
- `<Section heading="Shipping">` frozen address
- If shop owner viewing an order delivered to their shop (cross-cluster — possibly out of scope; clarify with Adam)

---

## 7. Verification gates

Same as WINE-68 §7.

---

## 8. Risks and open decisions

- **`useGetOrders` list hook may be missing.** Per page-stubs audit, only `useGetOrdersById` exists. Adam handles this off to BE; FE plan renders error state in `/orders` until hook lands.
- **`/checkout/confirmed?orderId=…`** assumes the checkout flow currently in `/cart` POSTs the order and redirects with an `orderId` param. Verify the redirect target during execution.
- **AddressForm reuse may conflict with WINE-59.** Both branches move it to `components/forms/`. Coordinate merge order.
- **Cart already has tests** (Sidebar test mentioned). Tests must remain passing after the audit pass.

---

## 9. Success criteria

1. 4 new files in `components/orders/` (+ 4 tests).
2. AddressForm moved to `components/forms/`.
3. `CartEmpty` deleted, replaced by `<EmptyState>` inline.
4. 4 routes migrated.
5. Tests + typecheck + biome all green.
6. Adam confirms cart→checkout→confirmed→orders happy path end-to-end.
7. Branch has ≥10 commits prefixed `feat(WINE-71):` / `refactor(WINE-71):` / `chore(WINE-71):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely:
- `useGetOrders` or `useGetOrdersMe` for customer orders list
- Whether `/checkout/confirmed` should auto-redirect from `/cart` POST
