# Backend Module Breakdown

## Module Ownership

### Ondra's Modules (8 modules, 40+ endpoints)
- **Auth**: register, login, refresh, logout, me
- **Users**: profiles, addresses, role requests, approvals
- **Wines**: catalog CRUD, filtering
- **Winemakers**: profile management
- **Events**: creation, approval, registration, management
- **Comments**: event comments CRUD
- **Email**: transactional email service
- **Admin**: user management, statistics (shared)

### Johnny's Modules (6 modules, 35+ endpoints)
- **Shops**: shop CRUD, availability, hours
- **Products**: products, bundles, inventory
- **Carts**: cart management, operations
- **Orders**: checkout, order management, status
- **Reviews**: product and winemaker reviews
- **Admin**: moderation, deletions (shared)

---

## Implementation Order (3 Phases)

### Phase 1: Foundation (Week 8)
1. Database setup (Drizzle migrations)
2. Auth module (Ondra)
3. Users module (Ondra)

### Phase 2: Core (Weeks 8-9)
4. Wines (Ondra) ← Users done
5. Shops (Johnny) ← Users done
6. Products (Johnny) ← Wines done
7. Carts (Johnny) ← Products done

### Phase 3: Advanced (Weeks 9-10)
8. Orders (Johnny) ← Carts done
9. Events (Ondra) ← Winemakers done
10. Comments (Ondra) ← Events done
11. Reviews (Johnny) ← Products done
12. Admin (Both)

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
  │   ├─ PRODUCTS (depends on WINES, SHOPS)
  │   │   ├─ CARTS (depends on PRODUCTS)
  │   │   │   └─ ORDERS (depends on CARTS, USERS)
  │   │   └─ BUNDLES (depends on WINES)
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
