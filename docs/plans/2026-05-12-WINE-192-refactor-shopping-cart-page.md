# WINE-192 — Cart + Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish `/cart` (mostly wired already) and replace the stub on `/checkout/confirmed` with real UI. Migrate existing cart-specific components to use WINE-187 primitives.

**Architecture:** Same cascade pattern. Existing cart-specific components in `routes/-components/cart/` get audited and partially moved to `components/cart/` (or `components/forms/` for `AddressForm`). The orders list and orders detail routes are NOT in this ticket — they live in WINE-73.

**Tech Stack:** Same as WINE-189.

**Predecessor:** WINE-187 merged. Soft dependency on WINE-73 if `<AddressForm>` is moved to `components/forms/` there first.

---

## Hard rules

Identical to WINE-189 §"Hard rules". Conventional commit prefix here: `feat(WINE-192):` / `refactor(WINE-192):` / `chore(WINE-192):`.

**Special note:** `/cart` is NOT a stub on dev — it has real implementation already. Treat it as an audit-and-migrate target, not a greenfield route.

---

## 1. Branch bootstrap

Branch `WINE-192-refactor-shopping-cart-page` exists locally clean.

```powershell
git fetch origin
git checkout WINE-192-refactor-shopping-cart-page
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-192): bring in WINE-187 foundation primitives"
bun run --filter web test --run
bun run --filter web check-types
git push -u origin WINE-192-refactor-shopping-cart-page
```

Once WINE-187 lands in dev, the merge step is unnecessary.

---

## 2. Scope

**In:** `/cart` audit-and-migrate, `/checkout/confirmed` real UI.

**Out:**
- `/orders`, `/orders/$id` — owned by WINE-73.
- Payment integration (out of project scope — orders are placed without real payment).
- Email receipts.

---

## 3. Architecture decisions

### 3.1 Existing cart components

In `apps/web/src/routes/-components/cart/`:
- `AddressForm.tsx` — used by checkout AND (in WINE-73) dashboard profile. **Move to `components/forms/`** so both consumers import from the same place. If WINE-73 also moves this file, coordinate so only one of you actually executes the move (the other rebases).
- `CartEmpty.tsx` — delete; replace with `<EmptyState>` primitive inline in the route.
- `CartItemRow.tsx` — keep, migrate violations.
- `CartSection.tsx` — keep.
- `CartSummary.tsx` — keep, migrate violations.
- `CheckoutSection.tsx` — keep, audit.
- `DeliveryMethodToggle.tsx` — keep.
- `QuantityControl.tsx` — keep.

### 3.2 Confirmed page

`/checkout/confirmed?orderId=$id` reads `orderId` from search params, fetches `useGetOrdersById`, renders:
- Success block with check icon + "Order placed!" + order number
- `<OrderTotalsBlock>` and item summary

**Note:** `<OrderTotalsBlock>` and `<OrderItemRow>` are WINE-73 territory. If WINE-73 hasn't landed first, WINE-192 inlines a minimal version of these locally; consolidate when WINE-73 merges. Add a note in the commit message.

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/forms/AddressForm.tsx` | (moved from `routes/-components/cart/`) | Shared address form |
| `apps/web/src/components/forms/AddressForm.test.tsx` | ~30 | If not already tested |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/cart.tsx` | Audit pass: swap inline skeletons to `<LoadingState>`, inline error to `<ErrorState>`, inline empty to `<EmptyState>`, `<Section>` heading wraps |
| `apps/web/src/routes/checkout.confirmed.tsx` | Replace stub with confirmed-page UI |

### 4.3 Delete / move

| Path | Action | Reason |
|---|---|---|
| `routes/-components/cart/AddressForm.tsx` | `git mv` → `components/forms/AddressForm.tsx` | Reused by dashboard (WINE-73) |
| `routes/-components/cart/CartEmpty.tsx` | DELETE | Replaced by `<EmptyState>` |

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2: Move `<AddressForm>` to `components/forms/`

`git mv routes/-components/cart/AddressForm.tsx apps/web/src/components/forms/AddressForm.tsx`. Update importers. Audit for violations. Add test if not present (≥4 tests). Commit: `refactor(WINE-192): move AddressForm to components/forms/ for reuse`.

If WINE-73 also moves this file, the second branch to merge rebases and skips this task.

### Task 3: Migrate `/cart` route — audit pass

Read the existing route. Identify violations (inline skeleton, inline error UI, hardcoded colors). Replace with primitives. Wrap sections in `<Section heading>`. Do NOT rewrite business logic. Commit: `refactor(WINE-192): migrate /cart route to primitive layer`.

### Task 4: Delete `CartEmpty.tsx`

Replace its single usage in `/cart` with `<EmptyState message="Your cart is empty." action={<Button as={Link} to="/explore">Browse wines</Button>} />`. Commit: `chore(WINE-192): replace CartEmpty with EmptyState primitive`.

### Task 5: Migrate `/checkout/confirmed` route

Replace stub. Use `useGetOrdersById(orderId)` from `Route.useSearch().orderId`. Render:
- `<Card variant="section">` confirmation block with check icon + order id
- `<OrderTotalsBlock>` (from WINE-73 if available, else inline)
- `<DataGrid variant="list">` of `<OrderItemRow>` (from WINE-73 if available, else inline)
- "View order" → `/orders/$id` (WINE-73 route) + "Back to shopping" → `/explore`

Commit: `feat(WINE-192): migrate /checkout/confirmed to cascade pattern`.

### Task 6: Audit kept cart components

For each of `CartItemRow`, `CartSection`, `CartSummary`, `CheckoutSection`, `DeliveryMethodToggle`, `QuantityControl`: migrate violations. Commit per file or one batch commit: `refactor(WINE-192): migrate kept cart components to primitive layer`.

### Task 7: Final verification

Manual sweep:
- `/cart` empty
- `/cart` with items (qty changes, delivery toggle, remove item)
- Checkout flow → `/checkout/confirmed?orderId=…` with a real order id
- Dark mode parity

---

## 6. Per-route descriptions

### 6.1 `/cart` (audit-only, structure stays)

Current structure mostly correct. Goal: primitive parity (no hand-rolled skeletons, no inline error UI, no hardcoded colors).

### 6.2 `/checkout/confirmed`

- Big success block top: green check icon (`<HugeiconsIcon icon={...} />`), "Order placed!", order id badge
- `<OrderTotalsBlock>` (WINE-73 component or inline)
- Items summary (WINE-73 `<OrderItemRow>` or inline)
- Two CTA buttons: "View order" → `/orders/$id`, "Back to shopping" → `/explore`

---

## 7. Verification gates

Same as WINE-189 §7.

---

## 8. Risks and open decisions

- **`<OrderTotalsBlock>` / `<OrderItemRow>` dependency on WINE-73.** Inline minimal versions if WINE-73 hasn't landed. Reconcile when it merges.
- **AddressForm move may conflict with WINE-73.** Coordinate — one branch executes the move, the other rebases.
- **`/checkout/confirmed?orderId=`** assumes the checkout flow currently in `/cart` POSTs the order and redirects with `orderId` search param. Verify during execution.
- **Cart already has tests.** They must remain passing after the audit pass.

---

## 9. Success criteria

1. `<AddressForm>` moved to `components/forms/`.
2. `CartEmpty` deleted, replaced by `<EmptyState>` inline.
3. `/cart` and `/checkout/confirmed` migrated.
4. Kept cart components audit-clean.
5. Tests + typecheck + biome all green.
6. Adam confirms cart → checkout → confirmed happy path.
7. Branch has ≥6 commits prefixed `feat(WINE-192):` / `refactor(WINE-192):` / `chore(WINE-192):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely:
- Whether `/checkout/confirmed` should auto-redirect from `/cart` POST
