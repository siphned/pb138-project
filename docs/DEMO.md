# WineMarket Milestone 3 Demo Script

**Duration**: 10-15 minutes  
**Evaluator Instructions**: Follow this script step-by-step to see all major features working.

---

## Pre-Demo Setup (5 minutes before)

```bash
# 1. Ensure services are running
docker compose up -d
bun dev  # or bun run dev:web & bun run dev:server

# 2. Wait for servers to start
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Swagger API docs: http://localhost:3000/swagger
```

**Expected Output**:
```
[Web] ready in 123ms
[Server] ready in 456ms
```

---

## Demo Flow (10-15 min)

### 1. Public Guest Experience (1 min)

**Scenario**: A potential customer visiting WineMarket for the first time.

1. Navigate to http://localhost:5173
2. Click "Explore Wines" or "Browse"
   - See wine catalog (images, price, ratings)
   - Filter by region, type, color
3. Click a wine → See detail page with winemaker info
4. Click "Add to Cart" → Cart updates
5. Browse "Events" → See upcoming winemaker events
6. Try to checkout → Redirected to sign up

**What You're Seeing**:
- ✅ Server-side guest session (no account needed to browse/cart)
- ✅ OpenAPI-generated Orval hooks fetching data
- ✅ Component library consistency (shadcn/ui primitives)
- ✅ Dark/light theme (toggle in header)

---

### 2. Customer Role Journey (3 min)

**Scenario**: User signs up, becomes customer, places an order.

#### Step 2a: Sign Up
1. Click "Sign Up" (top-right or redirect from checkout)
2. Enter any test email (e.g., `customer@test.com`)
3. Clerk modal handles auth flow (email/password or OAuth)
4. System auto-creates database user record
5. Redirect to onboarding or dashboard

**Expected**: User lands in `/dashboard`

#### Step 2b: Browse & Order
1. Go back to `/explore` or `/wines`
2. Add wine product to cart
3. Proceed to `/checkout`
4. Enter shipping address
   - Fetch pre-saved addresses or enter new
5. Choose delivery type: "Pickup" or "Shipping"
6. Choose payment method: "Card", "Bank Transfer", "Cash on Delivery"
7. Click "Place Order"

**Expected Response**:
```json
{
  "id": "order_abc123",
  "status": "pending",
  "totalPrice": "29.99",
  "items": [ ... ],
  "createdAt": "2026-05-24T..."
}
```

#### Step 2c: View Order History
1. Go to `/dashboard/orders` (authenticated)
2. See order in list with status "pending"
3. Click order → See detail page
   - Order items, shipping address, delivery type
4. Check email inbox (Resend notification sent if configured)

**What You're Seeing**:
- ✅ Cart persistence (guest cart merged on login)
- ✅ Stock validation (products prevent oversell)
- ✅ Multi-shop orders (items from different shops grouped)
- ✅ Address freezing (shipping address frozen at order time)
- ✅ Order status tracking
- ✅ Email notifications (if Resend API key configured)

---

### 3. Winemaker Role & Wine Management (2 min)

**Scenario**: Winemaker creates wine catalog and hosts event.

#### Step 3a: Request Winemaker Role
1. Sign up as new user (e.g., `winemaker@test.com`)
2. Go to `/dashboard/roles` (after auto-login)
3. Click "Request Winemaker Role"
4. Submit request (awaits admin approval)
5. In separate browser tab, sign in as admin to approve

#### Step 3b: Create Wine
1. Go to `/winemaker/wines` (after approval)
2. Click "Add Wine"
3. Fill form:
   - Name: "Sauvignon Blanc 2023"
   - Type: "White"
   - Region: "Loire Valley"
   - Country: "France"
   - Vintage: 2023
   - Alcohol: 12.5%
   - Volume: 750ml
   - Upload image (or skip)
4. Click "Create"

**Expected**: Wine appears in public `/wines` catalog

#### Step 3c: Create Event
1. Go to `/winemaker/events`
2. Click "Create Event"
3. Fill:
   - Title: "Loire Valley Tasting 2024"
   - Date/Time: Pick future date
   - Description: "Join us for exclusive tasting"
   - Location: "Our vineyard"
4. Submit

**Expected**: Event is created but marked as "pending" (awaits admin approval)

**What You're Seeing**:
- ✅ Role request workflow
- ✅ Multi-step form validation
- ✅ Image upload integration
- ✅ Admin moderation gates (events pending approval)
- ✅ Real-time data refresh (TanStack Query)

---

### 4. Shop Owner & Product Management (2 min)

**Scenario**: Shop owner manages inventory and processes orders.

#### Step 4a: Create Shop
1. Sign in as shop owner (e.g., `owner@test.com`)
2. Go to `/shops/me` or `/dashboard/shops`
3. Click "Create Shop"
4. Fill:
   - Name: "Wine Boutique Downtown"
   - Description: "Premium selection"
   - Address: Full address
5. Submit

**Expected**: Shop ID assigned, shop listed

#### Step 4b: Add Products
1. Go to `/shops/:id` (your shop detail)
2. Click "Add Product"
3. Select wine: "Sauvignon Blanc 2023" (from winemaker)
4. Fill:
   - Quantity: 50
   - Price: $24.99
5. Submit

**Expected**: Product appears in shop catalog

#### Step 4c: View Orders
1. Go to `/shops/me`
2. Click shop → "Orders" tab
3. See orders targeting this shop
4. Click order item → Change status: pending → confirmed → shipped → delivered

**What You're Seeing**:
- ✅ Shop CRUD with nested routes
- ✅ Product inventory management
- ✅ Order fulfillment workflow
- ✅ Status transition validation
- ✅ Multi-shop order isolation

---

### 5. Admin Moderation (1 min)

**Scenario**: Admin approves pending content and manages users.

#### Step 5a: Set Up Admin Account

**Via Database** (fastest for demo):
```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Add admin role to any user
UPDATE user_roles SET role = 'admin' WHERE user_id = '<your-user-id>';
```

Or:
1. Sign up as new user
2. Contact project maintainer to add admin role via database

Then:
1. Log in with admin account
2. Go to `/admin` (Clerk role check)

**Expected**: Admin dashboard loads

#### Step 5b: Approve Events
1. Go to `/admin/events-approval`
2. See pending events (winemaker created one earlier)
3. Click event → "Approve" or "Reject"
4. Approve the Loire Valley event

**Expected**: Event now appears in public `/events`

#### Step 5c: Review Users
1. Go to `/admin/users`
2. See user list (filterable by role, status)
3. Click user → Modify status: "active" → "suspended" (demo, then revert)

**What You're Seeing**:
- ✅ RBAC gates (admin-only routes)
- ✅ Content moderation workflow
- ✅ User management interface
- ✅ Role-based filtering

---

### 6. API & Technical Verification (1 min)

**Scenario**: Verify backend API and OpenAPI documentation.

#### Step 6a: Swagger Documentation
1. Open http://localhost:3000/swagger
2. Explore endpoint list:
   - `/wines` (GET, POST)
   - `/orders` (GET, POST /checkout)
   - `/shops` (GET, POST)
   - `/admin/events` (GET, POST approve/reject)
3. Try "Try it out" on `/wines`
4. Provide bearer token (copy from Clerk in DevTools)
5. Execute request

**Expected**: 200 response with wine data

#### Step 6b: Network Inspection (DevTools)
1. Open DevTools (F12) → Network tab
2. Refresh page
3. Filter for XHR/Fetch
4. Click request → Inspect:
   - **Request**: Authorization header with Bearer token
   - **Response**: Typed JSON (matches Zod schema)
5. Check Console → No TypeScript errors

**What You're Seeing**:
- ✅ OpenAPI auto-generated from Zod
- ✅ Full TypeScript type safety (frontend ↔ backend)
- ✅ Clerk JWT integration
- ✅ Error handling with semantic HTTP codes

---

## Feature Checklist ✅

### User Management
- [ ] Guest cart (no signup needed)
- [ ] Sign up → automatic customer role
- [ ] Role request workflow (winemaker/shop_owner)
- [ ] Admin role approval

### Catalog & Commerce
- [ ] Browse wines (public, no auth)
- [ ] Create wine (winemaker only)
- [ ] Create shop (shop_owner only)
- [ ] Add products to shop
- [ ] Add to cart (guest/auth)
- [ ] Place order (checkout)
- [ ] Multi-shop order handling

### Events
- [ ] Create event (winemaker)
- [ ] Event pending approval (admin gate)
- [ ] Register for event (customer)
- [ ] Event comments (customer)

### Moderation
- [ ] Admin approves events
- [ ] Admin manages users
- [ ] Soft-delete wines/shops (ownership check)

### Technical
- [ ] Dark/light theme (CSS variables, Tailwind)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation (Zod schemas)
- [ ] Error messages (semantic HTTP codes)
- [ ] Loading states (Skeleton, spinners)
- [ ] Email notifications (if RESEND_API_KEY set)

---

## Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check port 3000 is free
lsof -i :3000

# Check environment variables
cat apps/server/.env.local
```

### Frontend won't start
```bash
# Clear cache
rm -rf apps/web/.vite
rm -rf node_modules/.vite

# Restart Vite
bun run dev:web
```

### Database issues
```bash
# Reset database
docker compose down -v
docker compose up -d
bun run db:migrate
bun run db:seed
```

### Clerk auth not working
```bash
# Ensure .env.local has:
VITE_CLERK_PUBLISHABLE_KEY=...
# (In browser DevTools, check Clerk modal loads)
```

### Images not uploading
```bash
# Check Clerk token is valid
# Check image folder permissions
ls -la apps/server/public/images/
```

---

## Demo Talking Points

1. **Architecture**: Modular monolith with 3-layer backend
   - Show `docs/ARCHITECTURE/architecture.md`
   - Point to module structure in `apps/server/src/modules/`

2. **RBAC**: Role-based access control via Clerk
   - Demo switching between customer/winemaker/admin roles
   - Show role checks in route guards

3. **Type Safety**: Zod schemas as single source of truth
   - Show schema file (e.g., `wines.schema.ts`)
   - Explain: schema → types + validation + OpenAPI

4. **Code Quality**:
   - Show test coverage: `bun run test:coverage`
   - Explain CI/CD gates: Biome, TypeScript, Vitest

5. **User Experience**:
   - Theme switching (light/dark)
   - Loading skeletons (from shadcn)
   - Error messages (semantic HTTP codes)
   - Mobile responsiveness

---

## Post-Demo: Code Walkthrough (Optional)

If time allows:

1. **Backend Service Pattern**
   ```bash
   # Show wines.service.ts
   # Point out: validation, business logic, repository calls
   # Explain: services check roles before DB access
   ```

2. **Frontend Hook Pattern**
   ```bash
   # Show generated hooks in apps/web/src/generated
   # Explain: auto-generated from OpenAPI
   # Demonstrate: useWinesGet() hook in component
   ```

3. **Database Schema**
   ```bash
   # Show apps/server/src/db/schema.ts
   # Point out: 24+ entities, relationships
   # Explain: Drizzle migrations auto-generated
   ```

4. **Testing**
   ```bash
   # Run tests: bun run test
   # Show: unit tests, integration tests
   # Coverage: >60%
   ```

---

**End of Demo** ✨

Time: 10-15 minutes  
All major features demonstrated: user flows, roles, catalog, orders, moderation, API
