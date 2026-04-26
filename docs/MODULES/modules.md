# Backend Module Breakdown

## Module Ownership

### Ondra's Modules (8 modules, 40+ endpoints)
- **Auth**: Clerk JWT validation via `authPlugin` macro (no register/login — Clerk handles it)
- **Users**: profiles (`GET/PUT /users/me`), addresses, role metadata
- **Wines**: catalog CRUD, filtering, soft-delete
- **Winemakers**: profile management, portfolio
- **Events**: creation, approval workflow (pending→approved→rejected), registration
- **Comments**: _(deferred — not yet implemented)_
- **Email**: _(deferred — not yet implemented)_
- **Admin**: user status management, event moderation, review deletion (shared)

### Johnny's Modules (6 modules, 35+ endpoints)
- **Shops**: shop CRUD, availability (regular hours + exceptions)
- **Products**: products, bundles (with wine M:N), inventory
- **Carts**: server-side cart for guests (guest_session cookie) and users (JWT)
- **Orders**: checkout (stock decrement, address freeze), order history, per-item status
- **Reviews**: product + winemaker reviews (soft-delete, verified-purchase check for products)
- **Supply Agreements**: B2B winemaker-to-shop supply relationships (added Week 10)
- **Admin**: event approval/rejection, review soft-delete (shared)

---

## Implementation Status (Week 11)

All backend modules are implemented and wired into `app.ts`. The three-phase plan has been completed.

### Phase 1: Foundation ✅ Complete
1. Database setup (Drizzle migrations) ✅
2. Auth module (Clerk-based authPlugin macro) ✅
3. Users module ✅

### Phase 2: Core ✅ Complete
4. Wines ✅
5. Shops ✅
6. Products (including bundles) ✅
7. Carts (server-side; supports guest sessions) ✅

### Phase 3: Advanced ✅ Complete
8. Orders (checkout with stock decrement + address freeze) ✅
9. Events (with approval workflow) ✅
10. Reviews (product + winemaker, soft-delete) ✅
11. Admin (user management, event moderation, review deletion) ✅
12. Guest Sessions (anonymous cart sessions via cookie) ✅
13. Availability (shop hours, exceptions) ✅
14. Role Requests (winemaker/shop-owner application flow) ✅
15. Supply Agreements (B2B winemaker-to-shop) ✅
16. Winemakers (profiles) ✅

---

## File Naming Convention

All modules follow:
```
module_name/
├── module_name.routes.ts
├── module_name.service.ts
├── module_name.repository.ts
├── module_name.schema.ts
└── index.ts
```

---

## Module Dependencies

```
AUTH (foundation)
  ├─ USERS (depends on AUTH)
  │   ├─ WINEMAKERS (depends on USERS)
  │   ├─ SHOPS (depends on USERS)
  │   └─ EVENTS (depends on USERS, WINEMAKERS)
  │
  ├─ WINES (depends on USERS→WINEMAKERS)
  │   ├─ PRODUCTS (depends on WINES, SHOPS) — includes WineBundles (via Product_wines M:N)
  │   │   ├─ CARTS (depends on PRODUCTS)
  │   │   │   └─ ORDERS (depends on CARTS, USERS)
  │
  └─ REVIEWS (depends on PRODUCTS, WINEMAKERS, USERS)
  └─ COMMENTS (depends on EVENTS, USERS)
  └─ EMAIL (called by all modules)
  └─ ADMIN (oversees all modules)
```

Build in dependency order so when you need another module, it's done!

---

## Code Review Checklist

Every module must have:
- ✅ All endpoints from API spec implemented
- ✅ Role checks from roles.md enforced
- ✅ Zod schemas for all inputs/outputs
- ✅ Service layer never calls repository directly from routes
- ✅ Proper error handling
- ✅ Tests (unit + integration)
- ✅ Documentation updated

---

## Revision History
- **v1.0** (Week 6) — Module ownership and implementation plan
- **v1.1** (Week 11) — Updated phase status to reflect completed implementation; corrected auth approach (Clerk replaces custom JWT); added Supply Agreements and Guest Sessions modules; noted Comments and Email as deferred
