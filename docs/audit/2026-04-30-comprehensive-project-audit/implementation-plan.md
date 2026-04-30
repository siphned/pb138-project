# Implementation Plan — Milestone 3 Completion

**Date:** 2026-04-30
**Based on:** Comprehensive Project Audit (2026-04-30)
**Target:** Milestone 3 evaluation (Week 13) + Final Defense
**Time Budget:** ~5 weeks remaining (Weeks 8-13)
**Team:** Matej (lead+FE), Adam (FE), Ondra (BE), Johnny (BE)

---

## Overview

The project is at ~80% completion. Backend API is nearly complete (47 endpoints, 23 tables). Frontend has route structure but several pages are stubs. Missing pieces are well-defined and the implementation order below minimizes blocking dependencies.

**Estimated effort:** ~80-100 person-hours remaining across team.

---

## Phase 1: Backend Gaps (Week 8-9) — Ondra & Johnny

**Goal:** Complete all missing API endpoints and backend fixes. Frontend team should not be blocked.

### 1.1 Order Management Endpoints (Ondra, ~4h)
**Priority:** CRITICAL — blocks frontend order history page

**Files to modify:**
- `apps/server/src/modules/orders/orders.routes.ts` — add GET /orders and GET /orders/me
- `apps/server/src/modules/orders/orders.service.ts` — add `getOrdersForUser(userId)`, `getOrdersForShop(shopId, requesterId)`
- `apps/server/src/modules/orders/orders.repository.ts` — add `findByUserId(userId)`, `findByShopId(shopId)`
- `apps/server/src/modules/orders/orders.schema.ts` — add response schemas for order list

**Endpoints to add:**
```
GET /orders           → requireAuth, returns paginated orders for authenticated user
GET /orders/:id       → (exists) single order detail
PATCH /orders/:id     → requireRoles(shop_owner, admin), update order status
```

**Tests:**
- `orders.service.test.ts` — add tests for list and status update
- `orders.routes.test.ts` — add integration tests

### 1.2 Email Integration (Johnny, ~3h)
**Priority:** HIGH — course requirement

**Files to modify:**
- `apps/server/src/modules/email/email.service.ts` — verify templates exist for: order confirmation, role-request decision, event approval
- `apps/server/src/modules/orders/orders.service.ts` — call `emailService.sendOrderConfirmation()` after successful checkout
- `apps/server/src/modules/role-requests/role-requests.service.ts` — call email on approve/reject
- `apps/server/src/modules/admin/admin.service.ts` — call email on event approve/reject

**Implementation:**
```typescript
// In orders.service.ts checkout method, after order creation:
await emailService.sendOrderConfirmation({
  to: user.email,
  orderId: order.id,
  items: orderItems,
  total: order.totalAmount,
});
```

### 1.3 N+1 Query Fix (Ondra, ~1h)
**Priority:** HIGH — performance issue on every login

**File:** `apps/server/src/modules/users/users.service.ts`

**Current (bad):**
```typescript
for (const role of clerkRoles) {
  if (!existingRoles.includes(role)) {
    await this.userRolesRepo.addRole(userId, role);
  }
}
```

**Target (good):**
```typescript
// In user-roles.repository.ts
async syncRoles(userId: string, roles: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(
      and(eq(userRoles.userId, userId), notInArray(userRoles.role, roles))
    );
    await tx.insert(userRoles).values(
      roles.map(r => ({ userId, role: r }))
    ).onConflictDoNothing();
  });
}
```

### 1.4 Payment Simulation (Johnny, ~1h)
**Priority:** MEDIUM

**File:** `apps/server/src/modules/orders/orders.service.ts`

After creating order in checkout, auto-transition payment status:
```typescript
// Simulate payment (no real gateway per PRD)
await this.ordersRepo.updatePaymentStatus(order.id, "paid");
```

### 1.5 Winemaker/Shop Profile Auto-Creation (Ondra, ~2h)
**Priority:** HIGH — blocks onboarding flow

**File:** `apps/server/src/modules/role-requests/role-requests.service.ts`

On role-request approval:
- If type === "winemaker": create empty winemaker record linked to user
- If type === "shop_owner": create empty shop record linked to user

### 1.6 CORS Fix (Johnny, ~15min)
**File:** `apps/server/src/modules/../app.ts`
```typescript
.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }))
```

### 1.7 Service Cleanup (Ondra, ~1h)
- Consolidate duplicate `getAddresses`/`getAddressesForUser` methods
- Lazy-load Clerk client in users.service.ts
- Remove unused `_payload` parameter

### Phase 1 Deliverables Checklist
- [ ] GET /orders endpoint with user filtering
- [ ] PATCH /orders/:id status update endpoint
- [ ] Email triggers on checkout, role-request, event approval
- [ ] Batched role sync (no N+1)
- [ ] Payment auto-transition on checkout
- [ ] Winemaker/Shop profile auto-creation on approval
- [ ] CORS from env var
- [ ] Service method deduplication
- [ ] Regenerate OpenAPI spec + Kubb hooks after all changes

---

## Phase 2: Admin & Core Frontend (Week 9-10) — Adam & Matej

**Goal:** Implement all admin pages and complete critical user-facing features.

### 2.1 Admin User Management Page (Adam, ~4h)
**Route:** `_authenticated._admin.users.tsx`

**Implementation:**
```
┌─────────────────────────────────────────────┐
│ User Management                             │
│ ┌───────┬──────────┬────────┬──────────────┐│
│ │ Name  │ Email    │ Roles  │ Status       ││
│ ├───────┼──────────┼────────┼──────────────┤│
│ │ John  │ j@e.com  │ cust.  │ [Active ▼]   ││
│ │ Jane  │ j@e.com  │ wm,so  │ [Suspended ▼]││
│ └───────┴──────────┴────────┴──────────────┘│
└─────────────────────────────────────────────┘
```

**Hooks:** `useGetAdminUsers()`, `usePatchAdminUsersByIdStatus()`
**Components:** Table with status dropdown, role badges, pagination

### 2.2 Role Request Management Page (Adam, ~3h)
**Route:** `_authenticated._admin.role-requests.tsx`

**Implementation:**
- Table of pending requests with user info, requested role, date
- Approve/Reject buttons per row
- **Hooks:** `useGetRoleRequests()`, `usePatchRoleRequestsByIdApprove()`, `usePatchRoleRequestsByIdReject()`

### 2.3 Event Moderation Page (Adam, ~3h)
**Route:** `_authenticated._admin.moderation.tsx`

**Implementation:**
- Tab 1: Pending events (approve/reject)
- Tab 2: Reported reviews (delete/keep)
- **Hooks:** `useGetAdminEvents()`, approve/reject mutations, `useGetAdminReviews()`, delete mutation

### 2.4 Dark Mode Toggle (Matej, ~2h)
**Priority:** REQUIRED by course

**Files to create/modify:**
- `apps/web/src/hooks/useTheme.ts` — theme context with localStorage persistence
- `apps/web/src/components/layout/ThemeToggle.tsx` — sun/moon icon button
- `apps/web/src/components/layout/Header.tsx` — add ThemeToggle to header

**Implementation:**
```typescript
// useTheme.ts
function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" || (theme === "system" && prefersColorScheme("dark"))) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
```

### 2.5 Order History Page (Adam, ~3h)
**Route:** `_authenticated.orders.tsx`

**Implementation:**
- List of user's orders with status badges
- Click to expand/view detail
- **Hooks:** `useGetOrders()` (after Phase 1 endpoint is added + regenerated)

### 2.6 Customer Dashboard Enhancement (Matej, ~2h)
**Route:** `_authenticated.dashboard.tsx`

- Wire up real data to dashboard stats cards (order count, review count, etc.)
- Show recent orders, recent reviews
- Role-specific content already structured via tabs

### Phase 2 Deliverables Checklist
- [ ] Admin user management page (table + status toggle)
- [ ] Admin role-request page (list + approve/reject)
- [ ] Admin moderation page (events + reviews)
- [ ] Dark mode toggle with localStorage persistence
- [ ] Order history page
- [ ] Dashboard wired to real data

---

## Phase 3: Feature Completion (Week 10-11) — Full Team

**Goal:** Complete remaining feature pages and polish.

### 3.1 Event Comments Section (Adam, ~2h)
**File:** Event detail page component
- Add comment list using `useGetEventsByIdComments()`
- Add comment form using `usePostEventsByIdComments()`
- Show commenter name, date, content

### 3.2 Supply Agreements UI (Adam, ~3h)
**Winemaker side:** `_authenticated._winemaker.supply.tsx`
- List incoming supply requests
- Approve/reject each

**Shop owner side:** `_authenticated._shop_owner.manage.shops.$id.supply-browse.tsx`
- Browse available winemakers
- Send supply agreement request

### 3.3 Winemaker Onboarding Form (Matej, ~2h)
After role-request approved, show profile setup:
- Name, description, region, address
- Using `usePatchWinemakersMe()` mutation

### 3.4 Shop Onboarding Form (Matej, ~2h)
After role-request approved:
- Shop name, description, address, opening hours
- Using `usePostShops()` and availability endpoints

### 3.5 Product Reviews on Detail Page (Adam, ~2h)
Wire up `ProductReviewsSection` component:
- Show reviews via `useGetReviewsProductById()`
- Add review form for authenticated users

### 3.6 Loading/Error States Polish (Matej, ~2h)
- Add loading skeletons to all pages missing them
- Add error boundaries to route layouts
- Add empty state messages ("No orders yet", "No reviews yet")

### Phase 3 Deliverables Checklist
- [ ] Event comments section
- [ ] Supply agreements management (both sides)
- [ ] Winemaker onboarding form
- [ ] Shop onboarding form
- [ ] Product reviews on detail page
- [ ] Loading/error state polish across all pages

---

## Phase 4: Testing & Polish (Week 11-12) — Full Team

**Goal:** Comprehensive test coverage, deployment, final polish.

### 4.1 E2E Tests (Adam + Matej, ~6h)
**File:** `apps/web/src/__tests__/e2e/`

**Test scenarios to add:**
1. `catalog.spec.ts` — Browse wines → filter → view detail → navigate back
2. `cart.spec.ts` — Add product to cart → view cart → update quantity → remove item
3. `checkout.spec.ts` — Cart → checkout → verify order created (authenticated)
4. `dashboard.spec.ts` — Login → dashboard → verify role-based content
5. `admin.spec.ts` — Admin login → user management → change status (if test users available)

**Desktop viewport:** Add Chromium desktop project to playwright.config.ts

### 4.2 Backend Integration Tests (Ondra + Johnny, ~4h)
- Full checkout flow test (create cart → add items → checkout → verify stock decremented)
- Role-request → approval → profile creation flow
- Guest cart merge on login

### 4.3 Deployment (Matej, ~4h)
**Recommended:** Railway or Fly.io

**Steps:**
1. Add `Dockerfile` for backend (Bun runtime)
2. Add `Dockerfile` for frontend (static build served by nginx)
3. Configure PostgreSQL managed instance
4. Set environment variables (DATABASE_URL, CLERK keys, FRONTEND_URL)
5. Add deploy job to `.github/workflows/ci.yml`
6. Verify end-to-end flow on deployed URL

### 4.4 Final Polish (Full team, ~4h)
- Fix any remaining Biome warnings
- Ensure all pages look correct in dark mode
- Add responsive breakpoints to admin pages
- Update stale docs (references to "Orval" → "Kubb")
- Update README with deployment instructions

### Phase 4 Deliverables Checklist
- [ ] 5+ E2E test scenarios
- [ ] Desktop viewport E2E tests
- [ ] Backend integration tests for critical flows
- [ ] Deployed to staging environment
- [ ] Dark mode verified on all pages
- [ ] Stale documentation updated
- [ ] README with setup + deploy instructions

---

## Phase 5: Defense Preparation (Week 13)

### 5.1 Demo Script (~1h, Matej)
Prepare a walkthrough script covering:
1. Guest browsing → wine catalog → shop pages
2. Registration → role request → admin approval
3. Winemaker flow: add wine → create event
4. Shop owner flow: add product → manage inventory
5. Customer flow: browse → cart → checkout → order history
6. Admin flow: user management → event moderation → review moderation
7. Show dark/light mode toggle
8. Show deployed URL

### 5.2 Architecture Presentation (~1h, Matej)
Prepare slides/talking points:
- System architecture diagram (3-layer backend)
- Data flow: Zod → OpenAPI → Kubb → React hooks
- Auth flow: Clerk → JWT → macros → role guards
- Repository pattern decision and benefits
- CI/CD pipeline overview

### 5.3 Technical Q&A Prep (~1h, full team)
Common questions to prepare for:
- "Why Elysia over Express?"
- "How does your auth work end-to-end?"
- "How do you handle concurrent stock decrements?"
- "What happens when a user has multiple roles?"
- "How does the guest cart merge work?"
- "Why repository pattern? What did it give you?"
- "Show me a test. What does it verify?"

---

## Timeline Summary

| Week | Phase | Owner | Key Deliverables |
|------|-------|-------|-----------------|
| **8-9** | Phase 1: Backend Gaps | Ondra, Johnny | Order endpoints, email, N+1 fix, CORS |
| **9-10** | Phase 2: Admin & Core FE | Adam, Matej | Admin pages, dark mode, order history |
| **10-11** | Phase 3: Feature Completion | Full team | Comments, supply, onboarding, reviews |
| **11-12** | Phase 4: Testing & Polish | Full team | E2E tests, deployment, polish |
| **13** | Phase 5: Defense Prep | Full team | Demo script, presentation, Q&A prep |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Team members unavailable | Medium | High | Phases designed so tasks can be redistributed |
| Deployment issues | Medium | Medium | Start Phase 4.3 early; Railway has simple setup |
| Clerk auth breaks in production | Low | High | Test with production Clerk keys before defense |
| E2E tests flaky | Medium | Low | Use retry config, avoid timing-dependent assertions |
| Scope creep | Medium | Medium | Stick to this plan; no new features beyond PRD |

---

## Definition of Done (Milestone 3)

- [ ] All PRD features implemented and functional
- [ ] Admin back-office complete (user mgmt, moderation, role requests)
- [ ] Dark/light mode toggle working
- [ ] Email notifications on key actions
- [ ] 270+ unit tests passing (currently at 270)
- [ ] 10+ E2E tests covering critical flows
- [ ] Deployed to staging with working URL
- [ ] API documentation accessible via Swagger UI
- [ ] All Biome checks passing
- [ ] TypeScript strict mode, zero errors
- [ ] Demo script prepared for defense

---

**End of Implementation Plan**
