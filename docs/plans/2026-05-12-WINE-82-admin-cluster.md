# WINE-82 — Admin Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stubs on every `/_admin/*` route with real moderation/management UI. Surface: user management (status changes), role-request approvals, review moderation, event approvals, content listing (products, shops, winemakers).

**Architecture:** Same cascade pattern. New domain components in `apps/web/src/components/admin/`. Heavy on TanStack Table-style row layouts but using shadcn `<Table>` directly (no react-table dep — keep deps minimal). Mutation actions surface inline per row via shadcn `<DropdownMenu>` or buttons.

**Tech Stack:** Same as WINE-68 + shadcn `<Table>`.

**Predecessor:** WINE-187 merged.

---

## Hard rules

Identical to WINE-68 §"Hard rules". Conventional commit prefix here: `feat(WINE-82):` / `refactor(WINE-82):` / `chore(WINE-82):`.

---

## 1. Branch bootstrap

```powershell
git fetch origin
git checkout WINE-82-build-admin-interface-user-management-and-moderat
git reset --hard origin/dev
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-82): bring in WINE-187 foundation primitives"
```

If branch doesn't exist remotely, create off origin/dev locally.

Sanity test + force-push.

---

## 2. Scope

**In:** Every route under `_authenticated._admin.*`:
- `/admin` (redirect to `/stats` per page-stubs spec)
- `/_admin/users` (list)
- `/_admin/users/$id` (detail / status change)
- `/_admin/role-requests` (list)
- `/_admin/role-requests/$id` (detail / approve / reject)
- `/_admin/moderation` (review moderation)
- `/_admin/events` (event approval queue)
- `/_admin/products` (admin product list)
- `/_admin/shops` (admin shop list)
- `/_admin/winemakers` (admin winemaker list)

**Out:** Analytics dashboards (those are `/stats` for admin role — WINE-188). New BE moderation endpoints.

---

## 3. Architecture decisions

### 3.1 New folder `components/admin/`

Files:
- `AdminTable.tsx` — generic typed shadcn-`<Table>` wrapper with consistent header styling, loading/empty/error states baked in.
- `AdminUserRow.tsx` — single user row with status dropdown.
- `AdminRoleRequestRow.tsx` — single role-request row with Approve/Reject actions.
- `AdminReviewRow.tsx` — single review row with Delete action.
- `AdminEventRow.tsx` — single event row with Approve/Reject actions.
- `AdminContentRow.tsx` — generic row for products/shops/winemakers (status display + view link).
- `AdminStatusBadge.tsx` — colored badge for user/event/role-request statuses.

### 3.2 Generic AdminTable

```tsx
interface AdminTableProps<T> {
  columns: { key: string; label: string }[];
  rows: T[];
  renderRow: (row: T) => ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
}
```

Renders `<LoadingState variant="list">` while loading, `<ErrorState onRetry>` on error, `<EmptyState>` when empty, otherwise the table.

### 3.3 Mutation feedback

Inline button states: pending = disabled with spinner; success = toast (need toast primitive — defer or use `console.log` placeholder); error = inline error message under row.

Toast primitive is OUT OF SCOPE for this ticket. Document gap; flag in §10 BE backlog if a toast lib is wanted.

### 3.4 `/admin` redirect

Single-file replacement:

```tsx
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/admin")({
  component: () => <Navigate to="/stats" replace />,
});
```

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/admin/AdminTable.tsx` | ~70 | Generic table wrapper with state handling |
| `apps/web/src/components/admin/AdminStatusBadge.tsx` | ~30 | Colored badge per status |
| `apps/web/src/components/admin/AdminUserRow.tsx` | ~50 | One row with status change dropdown |
| `apps/web/src/components/admin/AdminRoleRequestRow.tsx` | ~50 | One row with Approve/Reject buttons |
| `apps/web/src/components/admin/AdminReviewRow.tsx` | ~45 | One row with Delete button |
| `apps/web/src/components/admin/AdminEventRow.tsx` | ~50 | One row with Approve/Reject buttons |
| `apps/web/src/components/admin/AdminContentRow.tsx` | ~40 | Read-only row for content listings |
| `apps/web/src/components/admin/<name>.test.tsx` (7 files) | ~25 each | |

### 4.2 Modified files (one per route, 10 total)

| Path | Body |
|---|---|
| `_authenticated._admin.admin.tsx` | `<Navigate to="/stats" />` |
| `_authenticated._admin.users.tsx` | `<AdminTable>` of `<AdminUserRow>` from `useGetAdminUsers` |
| `_authenticated._admin.users.$id.tsx` | Single user detail with full edit form for roles + status |
| `_authenticated._admin.role-requests.tsx` | `<AdminTable>` of `<AdminRoleRequestRow>` from `useGetRoleRequests` |
| `_authenticated._admin.role-requests.$id.tsx` | Single role-request detail with Approve/Reject form |
| `_authenticated._admin.moderation.tsx` | `<AdminTable>` of `<AdminReviewRow>` from `useGetAdminReviews` |
| `_authenticated._admin.events.tsx` | `<AdminTable>` of `<AdminEventRow>` from `useGetAdminEvents` |
| `_authenticated._admin.products.tsx` | `<AdminTable>` of `<AdminContentRow>` from `useGetProducts` |
| `_authenticated._admin.shops.tsx` | `<AdminTable>` of `<AdminContentRow>` from `useGetShops` |
| `_authenticated._admin.winemakers.tsx` | `<AdminTable>` of `<AdminContentRow>` from `useGetWinemakers` |

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2: Build `<AdminStatusBadge>` (TDD)

≥4 tests (one per status variant). Commit: `feat(WINE-82): add AdminStatusBadge`.

### Task 3: Build `<AdminTable>` (TDD)

Generic. ≥5 tests covering loading/error/empty/data states. Commit: `feat(WINE-82): add AdminTable generic wrapper`.

### Task 4-8: Build 5 row components (TDD, one task each)

`AdminUserRow`, `AdminRoleRequestRow`, `AdminReviewRow`, `AdminEventRow`, `AdminContentRow`. Each ≥4 tests including mutation button click behavior. Commits: `feat(WINE-82): add Admin<Name>Row component`.

### Task 9: Migrate `/admin` redirect

Single-line route replacement. Commit: `feat(WINE-82): redirect /admin to /stats`.

### Task 10-18: Migrate 9 admin list/detail routes

One commit per route. Each replaces the stub with the canonical orchestrator using `<AdminTable>` + the relevant row component. Commits: `feat(WINE-82): migrate /_admin/<route> to cascade pattern`.

### Task 19: Final verification

Sign in as admin role. Visit every admin route. Confirm:
- Lists render with sample data
- Status badges color correctly
- Approve/Reject buttons fire mutations
- Loading/error/empty states work
- Dark mode parity

If a hook is missing on the BE side, the affected route renders `<ErrorState>` — flag the gap.

---

## 6. Per-route descriptions

### 6.1 `/_admin/users` (list)

- `<PageHeader title="Users" />`
- Filter bar (top): role select (customer/winemaker/shop_owner/admin), status select (active/suspended/banned), q text.
- `<AdminTable>` with columns: name, email, roles, status, joined, actions.
- Row click → `/_admin/users/$id`.

### 6.2 `/_admin/users/$id`

- `<PageHeader title={user.fname + " " + user.lname} description={user.email} />`
- `<DescriptionList>` of full user info.
- Section "Status" with form (Select + Submit calling `usePutAdminUsersByIdStatus`).
- Section "Roles" with checkbox group of available roles (mutations TBD on BE).

### 6.3 `/_admin/role-requests`

- `<PageHeader title="Role requests" />`
- Filter: status (pending/approved/rejected).
- `<AdminTable>` columns: user, requested role, status, requested at, actions.
- Approve/Reject buttons inline call mutation hooks.

### 6.4 `/_admin/role-requests/$id`

- Full detail of the request + user's profile + their justification.
- Approve form / Reject form (textarea for rejection reason).

### 6.5 `/_admin/moderation`

- `<PageHeader title="Review moderation" />`
- Filter: entity type (wine/product/winemaker).
- `<AdminTable>` columns: author, target, rating, body excerpt, posted at, Delete button.

### 6.6 `/_admin/events`

- `<PageHeader title="Event approvals" />`
- Filter: status (pending/approved/canceled).
- `<AdminTable>` columns: title, winemaker, date, status, Approve/Reject.

### 6.7 `/_admin/products`, `/_admin/shops`, `/_admin/winemakers`

Read-only admin views. `<AdminTable>` of `<AdminContentRow>` with View link to the public canonical route.

---

## 7. Verification gates

Same as WINE-68 §7.

---

## 8. Risks and open decisions

- **Many mutation hooks unconfirmed.** `usePutAdminUsersByIdStatus`, `usePostRoleRequestsByIdApprove`, `usePostRoleRequestsByIdReject`, `usePutAdminEventsByIdApprove`, `usePutAdminEventsByIdReject` — verify each generated. Flag missing under §10.
- **Mutation feedback minimal.** No toast lib; on success the table refetches. Visible delay until row updates. Acceptable for moderation-style UI; not ideal.
- **Admin role detection.** Routes are gated by `_admin` layout — verify that layout's auth check is in place; if not, plan must add it (probably out of scope here; trust the existing pathless layout).

---

## 9. Success criteria

1. 7 new files in `components/admin/` (+ 7 tests).
2. 10 admin routes migrated.
3. Tests + typecheck + biome all green.
4. Adam visually confirms every admin route as admin user.
5. Branch has ≥17 commits prefixed `feat(WINE-82):` / `refactor(WINE-82):` / `chore(WINE-82):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely:
- `useGetAdminUsersById`
- `usePutAdminUsersByIdStatus`
- `usePostRoleRequestsByIdApprove`, `…Reject`
- `useGetRoleRequestsById`
- `useGetAdminEvents`, `usePutAdminEventsByIdApprove`, `…Reject`
- Filter params on each list endpoint
