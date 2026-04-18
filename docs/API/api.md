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

**Cart Notes:** Guest carts are session-based; authenticated users have persistent carts tied to their account.

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/cart` | Get cart | (guest=session, user=JWT) |
| POST | `/cart/items` | Add to cart | (guest=session, user=JWT) |
| PATCH | `/cart/items/:item_id` | Update quantity | (guest=session, user=JWT) |
| DELETE | `/cart/items/:item_id` | Remove from cart | (guest=session, user=JWT) |
| DELETE | `/cart` | Clear cart | (guest=session, user=JWT) |
| POST | `/orders` | Create order | ✅ |
| GET | `/orders/:id` | Order detail | ✅ (own/Admin) |
| GET | `/orders` | Order history | ✅ |
| PATCH | `/orders/:id/status` | Update status | ✅ (SHOP_OWNER of items/Admin) |
| GET | `/shops/:id/orders` | Shop orders | ✅ (own SHOP_OWNER) |

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
| GET | `/events/pending` | Pending events | ✅ (Admin) |
| POST | `/events/:id/approve` | Approve event | ✅ (Admin) |
| POST | `/events/:id/reject` | Reject event | ✅ (Admin) |

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
| DELETE | `/reviews/:id` | Delete review | ✅ (own/Admin) |
| PATCH | `/reviews/:id/hide` | Hide review | ✅ (Admin) |

---

## Module: ADMIN
**Responsibility**: Back-office administration

| Method | Path | Description | Auth |
|--------|------|---|---|
| GET | `/admin/users` | List users | ✅ (Admin) |
| PATCH | `/admin/users/:id/deactivate` | Deactivate user | ✅ (Admin) |
| GET | `/admin/statistics` | Platform stats | ✅ (Admin) |
| GET | `/admin/role-requests` | Pending requests | ✅ (Admin) |
| POST | `/admin/role-requests/:req_id/approve` | Approve request | ✅ (Admin) |
| POST | `/admin/role-requests/:req_id/reject` | Reject request | ✅ (Admin) |

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
