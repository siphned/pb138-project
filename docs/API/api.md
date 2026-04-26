# API Endpoint Design — WineMarket

## Overview
This document specifies all REST API endpoints for the WineMarket platform. Each endpoint is mapped to:
- HTTP method & path
- Request/response schemas (Zod-based)
- Authorization requirements (from `docs/roles.md`)
- Database operations (repository layer)

**Technology**: Elysia + Zod + OpenAPI → Auto-generated documentation via Scalar at `/swagger`. Frontend hooks generated via Orval (`apps/web/orval.config.ts`, `bun run generate`).

**Auth**: Clerk (replaces JWT/bcrypt). Tokens are Clerk-issued JWTs. The `authPlugin` Elysia macro handles validation and injects `dbUser` + `clerkPayload` into route context.

**Notes on Authorization:**
- `❌` = Public, no authentication required
- `✅` = Authentication required (Clerk JWT)
- `✅ (Admin)` = Admin role only
- `✅ (own)` = Own resource or Admin
- `✅ (WINEMAKER)` = Winemaker role required
- `✅ (SHOP_OWNER)` = Shop Owner role required

---

## Module: AUTH
**Responsibility**: User registration, login, token refresh, logout

| Method | Path | Description | Auth |
|--------|------|---|---|
| POST | `/auth/register` | Register new account | ❌ |
| POST | `/auth/login` | Login & receive JWT | ❌ |
| POST | `/auth/refresh` | Refresh token | ✅ |
| POST | `/auth/logout` | Invalidate session | ✅ |
| GET | `/auth/me` | Current user info | ✅ |

---

## Module: USERS
**Responsibility**: User profiles, addresses, role requests

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/users/:id` | Get profile | ❌ |
| PATCH | `/users/:id` | Update profile | ✅ (own) |
| GET | `/users/:id/addresses` | Get addresses | ✅ (own) |
| POST | `/users/:id/addresses` | Add address | ✅ (own) |
| PATCH | `/users/:id/addresses/:addr_id` | Update address | ✅ (own) |
| DELETE | `/users/:id/addresses/:addr_id` | Delete address | ✅ (own) |
| POST | `/users/:id/request-winemaker` | Request Winemaker role | ✅ |
| POST | `/users/:id/request-shop-owner` | Request Shop Owner role | ✅ |
| GET | `/role-requests` | Pending requests (Admin) | ✅ (Admin) |
| POST | `/role-requests/:req_id/approve` | Approve request | ✅ (Admin) |
| POST | `/role-requests/:req_id/reject` | Reject request | ✅ (Admin) |

---

## Module: WINES
**Responsibility**: Wine catalog, creation, editing

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/wines` | Browse wines (filtered) | ❌ |
| GET | `/wines/:id` | Wine detail | ❌ |
| POST | `/wines` | Create wine | ✅ (WINEMAKER) |
| PATCH | `/wines/:id` | Edit wine | ✅ (own) |
| DELETE | `/wines/:id` | Delete wine | ✅ (own) |

---

## Module: WINEMAKERS
**Responsibility**: Winemaker profiles

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/winemakers` | Browse winemakers | ❌ |
| GET | `/winemakers/:id` | Winemaker profile | ❌ |
| PATCH | `/winemakers/:id` | Edit profile | ✅ (own) |
| GET | `/winemakers/:id/wines` | Winemaker's wines | ❌ |
| GET | `/winemakers/:id/events` | Winemaker's events | ❌ |

---

## Module: SHOPS
**Responsibility**: Shop management, availability

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/shops` | Browse shops | ❌ |
| GET | `/shops/:id` | Shop detail | ❌ |
| PATCH | `/shops/:id` | Edit shop | ✅ (own) |
| GET | `/shops/:id/products` | Shop products | ❌ |
| POST | `/shops/:id/products` | Add product | ✅ (own) |
| PATCH | `/shops/:id/products/:prod_id` | Edit product | ✅ (own) |
| DELETE | `/shops/:id/products/:prod_id` | Remove product | ✅ (own) |
| GET | `/shops/:id/availability` | Shop hours | ❌ |
| POST | `/shops/:id/availability/regular` | Set hours | ✅ (own) |
| POST | `/shops/:id/availability/exceptions` | Add exception | ✅ (own) |

---

## Module: PRODUCTS & BUNDLES
**Responsibility**: Product catalog, bundles

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/products/:id` | Product detail | ❌ |
| POST | `/shops/:id/bundles` | Create bundle | ✅ (SHOP_OWNER) |
| PATCH | `/shops/:id/bundles/:bundle_id` | Edit bundle | ✅ (own) |
| DELETE | `/shops/:id/bundles/:bundle_id` | Delete bundle | ✅ (own) |

---

## Module: CARTS & ORDERS
**Responsibility**: Shopping cart, checkout, orders

**Cart Notes:** Guest carts are **server-side** — on the first cart action by an unauthenticated user, the backend creates a `guest_session` record and returns a `guest_session_id` cookie. Cart endpoints accept either a valid Clerk JWT (authenticated user) or the guest session cookie. On login, `POST /carts/merge` merges the guest cart into the user's account and clears the session. Stock is validated and atomically decremented at checkout.

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/carts/me` | Get current user's cart (creates if none) | ✅ |
| POST | `/carts/items` | Add item to cart (accumulates if already present) | ✅ |
| PUT | `/carts/items/:id` | Update cart item quantity | ✅ |
| DELETE | `/carts/items/:id` | Remove item from cart | ✅ |
| POST | `/carts/merge` | Merge guest localStorage items into user cart on login | ✅ |
| POST | `/orders` | Checkout — convert cart to order, clears cart | ✅ |
| GET | `/orders` | List current user's orders | ✅ |
| GET | `/orders/:id` | Get order by ID (own orders only) | ✅ |
| PUT | `/orders/:id/items/:itemId/status` | Update individual order item status | ✅ (SHOP_OWNER) |

**Checkout body:** `paymentMethod`, `deliveryType`, plus either `shippingAddressId` (existing) or `newShippingAddress` (inline object), same for billing. Stock is validated at checkout time.

**Order item statuses:** `pending` → `confirmed` → `shipped` → `delivered` (terminal). `cancelled` is also terminal. Shop owners can only update items belonging to their shop.

---

## Module: EVENTS
**Responsibility**: Event management, registration

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/events` | Browse events (approved) | ❌ |
| GET | `/events/:id` | Event detail | ❌ |
| POST | `/events` | Create event | ✅ (WINEMAKER) |
| PATCH | `/events/:id` | Edit event | ✅ (own) |
| DELETE | `/events/:id` | Cancel event | ✅ (own) |
| POST | `/events/:id/register` | Register for event | ✅ |
| DELETE | `/events/:id/register` | Cancel registration | ✅ (own) |
| GET | `/events/:id/registrations` | Get attendees | ✅ (own WINEMAKER) |

---

## Module: COMMENTS
**Responsibility**: Event comments

| Method | Path | Description | Auth |
|--------|------|---|---|
| POST | `/events/:id/comments` | Post comment | ✅ |
| DELETE | `/comments/:id` | Delete comment | ✅ (own/Admin) |
| PATCH | `/comments/:id/hide` | Hide comment | ✅ (Admin) |

---

## Module: REVIEWS & RATINGS
**Responsibility**: Product and winemaker reviews

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/reviews/product/:id` | Product reviews + avg rating | ❌ |
| POST | `/reviews/product/:id` | Write product review (requires verified purchase) | ✅ |
| GET | `/reviews/winemaker/:id` | Winemaker reviews + avg rating | ❌ |
| POST | `/reviews/winemaker/:id` | Write winemaker review | ✅ |
| DELETE | `/reviews/product/:id/:reviewId` | Soft-delete product review | ✅ (own/Admin) |
| DELETE | `/reviews/winemaker/:id/:reviewId` | Soft-delete winemaker review | ✅ (own/Admin) |

**Notes:** Routes live under `/reviews/` prefix (not `/products/:id/reviews`). Reviews are soft-deleted (retain record, set `deletedAt`). Admins can delete any review; users can only delete their own.

---

## Module: SUPPLY AGREEMENTS
**Responsibility**: B2B winemaker-to-shop supply relationships

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/supply-agreements` | List agreements (own winemaker or shop) | ✅ |
| POST | `/supply-agreements` | Create supply agreement | ✅ (WINEMAKER) |
| GET | `/supply-agreements/:id` | Agreement detail | ✅ (own) |
| PATCH | `/supply-agreements/:id` | Update agreement | ✅ (own) |
| DELETE | `/supply-agreements/:id` | Cancel agreement | ✅ (own) |

---

## Module: ADMIN
**Responsibility**: Back-office administration

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/admin/users` | List users (filterable by status/role) | ✅ (Admin) |
| PATCH | `/admin/users/:id/status` | Set user status (active/suspended/banned) | ✅ (Admin) |
| GET | `/admin/events` | List events by status (default: pending) | ✅ (Admin) |
| PATCH | `/admin/events/:id/approve` | Approve a pending event | ✅ (Admin) |
| PATCH | `/admin/events/:id/reject` | Reject a pending event | ✅ (Admin) |
| GET | `/admin/reviews` | List all reviews (product + winemaker) | ✅ (Admin) |
| DELETE | `/admin/reviews/:id` | Soft-delete a review | ✅ (Admin) |

---

## Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Revision History
- **v1.0** (Week 6) — Initial API design from PRD requirements
- **v1.1** (Week 9, WINE-79) — Admin module: event moderation moved from /events to /admin/events; user deactivate replaced with full status lifecycle (active/suspended/banned); review admin endpoints added under /admin/reviews; role-request admin routes removed (live at /role-requests without prefix); GET /admin/statistics deferred
- **v1.2** (Week 10, WINE-65) — Carts & Orders implemented: paths changed from /cart to /carts/me; PUT replaces PATCH for item updates; order status update is per-item; stock decremented at checkout
- **v1.3** (Week 11) — Guest cart corrected: server-side guest_session (cookie-based), not localStorage. Reviews paths corrected to `/reviews/product/:id` and `/reviews/winemaker/:id`. Supply-agreements module added. Admin event endpoints split into separate approve/reject routes. Auth updated to Clerk (not JWT/bcrypt).
