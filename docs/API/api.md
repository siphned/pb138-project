# API Endpoint Design — WineMarket

## Overview
This document specifies all REST API endpoints for the WineMarket platform. Each endpoint is mapped to:
- HTTP method & path
- Request/response schemas (Zod-based)
- Authorization requirements (from `docs/roles.md`)
- Database operations (repository layer)

**Technology**: Elysia + Zod + OpenAPI → Auto-generated documentation via Scalar

**Notes on Authorization:**
- `❌` = Public, no authentication required
- `✅` = Authentication required (JWT token)
- `✅ (Admin)` = Admin role only
- `✅ (own)` = Own resource or Admin
- `✅ (WINEMAKER)` = Winemaker role required
- `✅ (SHOP_OWNER)` = Shop Owner role required

---

## Module: USERS
**Responsibility**: User profiles, addresses, role requests

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/users/me` | Get current user record (lazy created from Clerk) | ✅ |
| PUT | `/users/me` | Update profile (first/last name) | ✅ |
| GET | `/users/me/addresses` | Get current user addresses | ✅ |
| POST | `/users/me/addresses` | Set a shipping or billing address | ✅ |
| GET | `/role-requests` | List all role requests | ✅ (Admin) |
| POST | `/role-requests/:id/approve` | Approve a role request | ✅ (Admin) |
| POST | `/role-requests/:id/reject` | Reject a role request | ✅ (Admin) |

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
| GET | `/winemakers/me` | Get current winemaker profile | ✅ (WINEMAKER) |
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

**Cart Notes:** The server supports both authenticated user carts and guest session carts. Guest sessions are identified via `guest_session_id` cookie. When a user logs in, their guest cart is automatically merged into their user cart.

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/carts` | Get current cart (user or session) | ❌/✅ |
| POST | `/carts/items` | Add item to cart | ❌/✅ |
| PUT | `/carts/items/:productId` | Update item quantity | ❌/✅ |
| DELETE | `/carts/items/:productId` | Remove item from cart | ❌/✅ |
| POST | `/orders/checkout` | Checkout — convert cart to order | ✅ |
| GET | `/orders/:id` | Get order details | ✅ (own) |

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
| GET | `/products/:id/reviews` | Product reviews | ❌ |
| POST | `/products/:id/reviews` | Write review | ✅ |
| GET | `/winemakers/:id/reviews` | Winemaker reviews | ❌ |
| POST | `/winemakers/:id/reviews` | Write review | ✅ |
| DELETE | `/products/:productId/reviews/:reviewId` | Delete product review | ✅ (own/Admin) |
| DELETE | `/winemakers/:winemakerId/reviews/:reviewId` | Delete winemaker review | ✅ (own/Admin) |
| DELETE | `/reviews/:id` | Delete own review | ✅ (own) |
| PATCH | `/reviews/:id/hide` | Hide review | ✅ (Admin) |

---

## Module: ADMIN
**Responsibility**: Back-office administration

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/admin/users` | List users (filterable by status/role) | ✅ (Admin) |
| PATCH | `/admin/users/:id/status` | Set user status (active/suspended/banned) | ✅ (Admin) |
| GET | `/admin/events` | List events by status (default: pending) | ✅ (Admin) |
| PATCH | `/admin/events/:id/status` | Approve or reject a pending event | ✅ (Admin) |
| GET | `/admin/reviews` | List all reviews (product + winemaker) | ✅ (Admin) |
| DELETE | `/admin/reviews/:id` | Soft-delete a review (?type=product\|winemaker) | ✅ (Admin) |

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
- **v1.2** (Week 10, WINE-65) — Carts & Orders implemented: paths changed from /cart to /carts/me; PUT replaces PATCH for item updates; guest cart is localStorage-only (no server sessions) with POST /carts/merge for login sync; order status update is per-item (PUT /orders/:id/items/:itemId/status) not per-order; /shops/:id/orders and DELETE /cart (clear) not implemented
- **v1.3** (Week 10, WINE-148) — Synchronized with actual implementation: removed outdated AUTH module (using Clerk); moved /auth/me to /users/me; updated /carts to support server-side guest sessions; added /winemakers/me; added /role-requests root routes.
