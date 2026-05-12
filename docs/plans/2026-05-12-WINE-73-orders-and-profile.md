# WINE-73 — User Order History + Profile Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stubs on `/orders` (list) and `/orders/$id` (detail) with real UI. Build the profile management components (`<DashboardProfileSection>` + `<DashboardAddressesList>`) consumed by WINE-191's `/dashboard` route. Centralize the shared `<AddressForm>` in `components/forms/`.

**Architecture:** Same cascade pattern. New domain components in `apps/web/src/components/orders/` and `apps/web/src/components/profile/`. The profile section is built here but mounted into `/dashboard` by WINE-191 — clean separation.

**Tech Stack:** Same as WINE-189.

**Predecessor:** WINE-187 merged. Soft dependency on WINE-192 if it moves `<AddressForm>` first.

---

## Hard rules

Identical to WINE-189 §"Hard rules". Conventional commit prefix here: `feat(WINE-73):` / `refactor(WINE-73):` / `chore(WINE-73):`.

---

## 1. Branch bootstrap

Branch `WINE-73-build-user-order-history-and-profile-management-pa` exists locally clean.

```powershell
git fetch origin
git checkout WINE-73-build-user-order-history-and-profile-management-pa
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-73): bring in WINE-187 foundation primitives"
bun run --filter web test --run
bun run --filter web check-types
git push -u origin WINE-73-build-user-order-history-and-profile-management-pa
```

Once WINE-187 lands in dev, the merge is unnecessary.

---

## 2. Scope

**In:**
- `/orders` list (replace stub).
- `/orders/$id` detail (replace stub).
- `<DashboardProfileSection>` + `<DashboardAddressesList>` (consumed by WINE-191 `/dashboard`).
- `<AddressForm>` move from `routes/-components/cart/` to `components/forms/` (if WINE-192 hasn't done it).

**Out:**
- `/dashboard` page wiring (WINE-191 owns the route file).
- Cart audit (WINE-192).
- Payment / receipt emails.

---

## 3. Architecture decisions

### 3.1 New folder `components/orders/`

- `OrderCard.tsx` — single order summary tile for the list page.
- `OrderItemRow.tsx` — one row of `orderItems` inside detail or confirmed page.
- `OrderStatusBadge.tsx` — colored badge per status (pending, preparing, shipped, delivered, canceled).
- `OrderTotalsBlock.tsx` — `<DescriptionList>` of subtotal + shipping + tax + total.

### 3.2 New folder `components/profile/`

- `DashboardProfileSection.tsx` — composes a `<UserInfoCard>`-style header + edit affordances + `<DashboardAddressesList>` inline. Exported for use by WINE-191's `/dashboard` route.
- `DashboardAddressesList.tsx` — list of addresses with Edit/Delete inline + "Add address" button opening shadcn `<Dialog>` with `<AddressForm>`.
- `ProfileEditForm.tsx` — inline edit form for `fname`, `lname`. Uses `usePutUsersMe` (from `UserContext.updateUser`).

The old `apps/web/src/components/dashboard/{ProfileEditForm,UserInfoCard}.tsx` are deleted by WINE-191. WINE-73 rebuilds them here in `components/profile/`.

### 3.3 Shared `<AddressForm>` move

The existing `routes/-components/cart/AddressForm.tsx` moves to `apps/web/src/components/forms/AddressForm.tsx`. If WINE-192 also moves it, the branch that lands SECOND rebases and skips its move task. Coordinate with WINE-192 author.

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/orders/OrderCard.tsx` | ~60 | Order summary card with status badge, total, item count, date, "View" link |
| `apps/web/src/components/orders/OrderItemRow.tsx` | ~50 | One line item — image, name, qty × price = subtotal |
| `apps/web/src/components/orders/OrderStatusBadge.tsx` | ~30 | Colored badge per status using shadcn `<Badge>` variants |
| `apps/web/src/components/orders/OrderTotalsBlock.tsx` | ~30 | `<DescriptionList>` of totals |
| `apps/web/src/components/profile/ProfileEditForm.tsx` | ~60 | Inline edit form for first/last name |
| `apps/web/src/components/profile/DashboardProfileSection.tsx` | ~70 | Profile header + edit + addresses |
| `apps/web/src/components/profile/DashboardAddressesList.tsx` | ~80 | Addresses CRUD UI |
| `apps/web/src/components/forms/AddressForm.tsx` | (moved) | Shared address form |
| `apps/web/src/components/orders/<name>.test.tsx` (4 files) | ~25 each | |
| `apps/web/src/components/profile/<name>.test.tsx` (3 files) | ~25 each | |
| `apps/web/src/components/forms/AddressForm.test.tsx` | ~30 | If not already tested |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/_authenticated.orders.tsx` | Replace stub with `<DataGrid variant="list">` of `<OrderCard>` from `useGetOrders` (or `useGetOrdersMe`) |
| `apps/web/src/routes/_authenticated.orders.$id.tsx` | Replace stub with detail UI using `<OrderItemRow>`, `<OrderTotalsBlock>`, address display |

### 4.3 Delete / move

| Path | Action | Reason |
|---|---|---|
| `routes/-components/cart/AddressForm.tsx` | `git mv` → `components/forms/AddressForm.tsx` | If WINE-192 hasn't moved it first |

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2-5: Build 4 new orders domain components (TDD, one task each)

`<OrderStatusBadge>`, `<OrderCard>`, `<OrderItemRow>`, `<OrderTotalsBlock>`. Each ≥3 tests. Commits: `feat(WINE-73): add <name> component`.

### Task 6: Build `<ProfileEditForm>` (TDD)

Inline form. Uses `useUser()` → `updateUser` mutation. ≥4 tests (load default values, edit, submit, validation error). Commit: `feat(WINE-73): add ProfileEditForm`.

### Task 7: Move `<AddressForm>` to `components/forms/` (if not already moved by WINE-192)

```powershell
git mv apps/web/src/routes/-components/cart/AddressForm.tsx apps/web/src/components/forms/AddressForm.tsx
```

Update importers. Audit for violations. Add test if missing. Commit: `refactor(WINE-73): move AddressForm to components/forms/ for reuse`.

If WINE-192 has already merged the move, skip this task; instead document in commit log.

### Task 8: Build `<DashboardAddressesList>` (TDD)

List of addresses with Edit/Delete inline + "Add address" `<Button>` opening shadcn `<Dialog>` containing `<AddressForm>`. Uses `useGetUsersMeAddresses`, `usePostUsersMeAddresses`, `usePutUsersMeAddressesByAddressId`, `useDeleteUsersMeAddressesByAddressId`. ≥5 tests. Commit: `feat(WINE-73): add DashboardAddressesList`.

### Task 9: Build `<DashboardProfileSection>` (TDD)

Composes `<ProfileEditForm>` + `<DashboardAddressesList>`. Layout: name/email header with inline edit affordance; addresses block below. ≥3 tests. Commit: `feat(WINE-73): add DashboardProfileSection`.

### Task 10: Migrate `/orders` route

Replace stub. Fetch list via `useGetOrders` (or `useGetOrdersMe` — verify which exists; if neither, route renders `<ErrorState message="Orders list endpoint missing" />` and flag in §10). On success, `<DataGrid variant="list">` of `<OrderCard>`. Empty state when zero. Commit: `feat(WINE-73): migrate /orders route to cascade pattern`.

### Task 11: Migrate `/orders/$id` route

Replace stub. Fetch `useGetOrdersById(id)`. Render:
- `<PageHeader title={`Order #${order.id.slice(0,8)}`} description={order.status} />`
- `<Section heading="Items">` `<DataGrid variant="list">` of `<OrderItemRow>`
- `<Section heading="Totals">` `<OrderTotalsBlock>`
- `<Section heading="Shipping">` rendered address block (use `<DescriptionList>`)

Commit: `feat(WINE-73): migrate /orders/$id route to cascade pattern`.

### Task 12: Final verification

Manual sweep:
- `/orders` as customer with orders / without orders
- `/orders/$id` with various statuses
- Dashboard route (WINE-191's branch) loads `<DashboardProfileSection>` correctly — coordinate test with WINE-191 author
- Dark mode parity

---

## 6. Per-route descriptions

### 6.1 `/orders`

- `<PageHeader title="Your orders" />`
- `<DataGrid variant="list">` of `<OrderCard>` ordered by `createdAt desc`
- `<EmptyState>` with "Browse wines" CTA when no orders.

### 6.2 `/orders/$id`

- Back link → `/orders`
- `<PageHeader>` with order id + status badge
- `<Section heading="Items">` table-like list
- `<Section heading="Totals">` price breakdown
- `<Section heading="Shipping">` frozen address

### 6.3 `<DashboardProfileSection>` (consumed by WINE-191)

- Header: avatar + `<ProfileEditForm>` (name fields inline-editable)
- Email shown read-only (Clerk-managed)
- `<DashboardAddressesList>` block below

---

## 7. Verification gates

Same as WINE-189 §7. Additionally: when WINE-191 lands, manually verify the `/dashboard` route renders `<DashboardProfileSection>` correctly with this branch's code.

---

## 8. Risks and open decisions

- **`useGetOrders` list hook may be missing.** Per page-stubs audit, only `useGetOrdersById` exists. Handle gracefully (error state); BE backlog flagged.
- **`<AddressForm>` move coordination with WINE-192.** First branch to land executes the move; second rebases and removes its duplicate move task.
- **`<DashboardProfileSection>` is owned by this ticket but mounted by WINE-191.** Coordinate import path: `@/components/profile/DashboardProfileSection`.

---

## 9. Success criteria

1. 4 new files in `components/orders/` (+ 4 tests).
2. 3 new files in `components/profile/` (+ 3 tests).
3. `<AddressForm>` moved to `components/forms/` (unless WINE-192 already did it).
4. `/orders` and `/orders/$id` use canonical orchestrator.
5. WINE-191's `/dashboard` route can import `<DashboardProfileSection>` after this branch merges.
6. Tests + typecheck + biome all green.
7. Branch has ≥11 commits prefixed `feat(WINE-73):` / `refactor(WINE-73):` / `chore(WINE-73):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely:
- `useGetOrders` or `useGetOrdersMe` for customer orders list
- Verify `useGetUsersMeAddresses` and the address CRUD hooks exist
