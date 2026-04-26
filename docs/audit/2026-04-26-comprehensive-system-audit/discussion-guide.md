# Discussion Guide — Design Decisions & Implications (2026-04-26)

This document outlines all critical and major decisions discovered in the audit, with options, trade-offs, and implications for each.

---

## Section 1: Critical Path-Blocking Issues

These three must be resolved immediately. They're broken functionality, not just style choices.

---

### **Issue C-01: Deleted Products in Order History**

**The Problem:**
When a product is deleted from the catalog, users viewing old orders still see the deleted product listed. This violates the soft-delete pattern (deleted = never existed).

**Example:**
```
User places order on April 1: 1x "Château Margaux 2015" @ $150
Winemaker deletes the product on April 15
User views order history on April 26: Order still shows the deleted product
```

**Three Options:**

#### **Option A: Filter Out (Hide Deleted Products)**
Remove order items whose products are deleted from the response.

```ts
// ordersRepository.findById
items.filter(item => !item.product.deletedAt)
```

**Pros:**
- Cleanest for users (no clutter)
- Matches soft-delete semantics (deleted = invisible)
- Easy to implement

**Cons:**
- Loses purchase history (user can't see what they bought anymore)
- Can't track partial refunds or returns for deleted items
- Invoice/receipt records become incomplete

**Example Result:**
```
User views April 1 order
Shows: "2x Wine A, 1x Wine B"
Hidden: "1x [deleted product]" 
User sees: "3 items ordered" but only sees 3 items
```

---

#### **Option B: Placeholder Replacement**
Replace deleted products with a placeholder showing "[Product Removed]".

```ts
// In service layer
if (!product || product.deletedAt) {
  return {
    id: null,
    name: "[Product Removed]",
    price: item.unitPriceAtPurchase,
    deletedAt: product?.deletedAt
  };
}
```

**Pros:**
- Users see complete purchase history (never miss items)
- Can show original price (proof of purchase)
- Complies with accounting/invoice requirements
- Clear why item isn't available

**Cons:**
- More clutter in UI
- Must handle null product.id in frontend
- More complex API response schema

**Example Result:**
```
User views April 1 order
Shows: "1x Château Margaux 2015 @ $150", "1x [Product Removed] @ $200"
User sees: Complete purchase history, understands what was deleted
```

---

#### **Option C: Flag & Track Deletion**
Return deleted product with explicit deletion metadata.

```ts
{
  product: {
    id: "...",
    name: "Château Margaux 2015",
    deletedAt: "2026-04-15T10:30:00Z",
    deletedBy: "winemaker_id"
  },
  quantity: 1,
  unitPriceAtPurchase: "150.00"
}
```

**Pros:**
- Complete audit trail (when/why was it deleted)
- Can show "This product is no longer available" with context
- Frontend can render specially (greyed out, "archived", etc.)
- Best for compliance/accounting

**Cons:**
- Most complex schema change
- Requires frontend special handling
- API contract changes

**Example Result:**
```
User views April 1 order
Shows: "1x Château Margaux 2015 @ $150 [DELETED on 2026-04-15]"
UI renders specially: greyed out, with deletion date
```

---

#### **Recommendation Factors:**

| Factor | Best Option |
|--------|------------|
| **Accounting/Legal** | C (audit trail) |
| **User Experience** | B (understands history) |
| **Simplicity** | A (easiest code) |
| **Ecommerce Standard** | B or C (Shopify/Amazon use C) |
| **Current Design** | Unclear (PRD didn't specify) |

**Decision Questions:**
- Is this system subject to accounting audits? (B2B features suggest yes → Option C)
- Should we maintain purchase history for disputes? (Yes → Option B or C)
- Do we need deletion audit trail? (Yes → Option C)

**Recommended:** **Option B or C** (Option A is risky legally if there are refunds/disputes)

---

### **Issue C-02: Deleted Winemakers in Event Listings**

**The Problem:**
If a winemaker account is deleted (soft delete), their events still appear in the public event listing with an orphaned winemaker reference.

**Related Decision: Cascade Delete Policy**

**Fundamental Question:** When a winemaker is deleted, what should happen to their events?

---

#### **Option A: Cascade Soft-Delete Events**
Deleting a winemaker marks all their events as deleted too.

```ts
// When winemaker is deleted
await db.update(events)
  .set({ deletedAt: new Date() })
  .where(eq(events.winemakerId, winemakerId));
```

**Pros:**
- Clean: no orphaned events
- Events disappear from listings automatically
- Clear cascading behavior throughout system
- No special handling needed

**Cons:**
- Users can't view "past" events from deleted winemakers
- Loss of event history (no audit trail of what events existed)
- Hard to recover if deletion is accidental

**Impact:**
- User deletes winemaker account on April 20
- All their events (past, present, future) become invisible
- Event registrations still exist in DB but are orphaned

---

#### **Option B: Orphan Events (Keep with Null Winemaker)**
Delete the winemaker but leave events intact with `winemakerId` still set.

Then in queries, filter out events where winemaker.deletedAt is not null.

```ts
// events.repository.ts findMany
const conditions = [
  isNull(events.deletedAt),
  eq(events.status, "approved"),
  // Add: winemakers must not be deleted
  isNull(winemakers.deletedAt),
];
```

**Pros:**
- Event history preserved (audit trail)
- Users can still view past events, understand what happened
- Can show "[Event by deleted winemaker]" in UI
- No cascading deletes (safer)
- Event registrations still valid (proof of attendance)

**Cons:**
- More complex queries (must join and filter winemakers)
- Database has "orphaned" events (still references deleted winemaker)
- Frontend must handle "no winemaker" case
- Requires filtering in every event query

**Impact:**
- Winemaker deletes account on April 20
- Events stay in DB with winemaker_id = "deleted_account_id"
- Queries filter them out (not visible to public)
- Admins can see them (include_deleted option)

---

#### **Option C: Replace with Archive Account**
When a winemaker is deleted, reassign their events to a special "Archive" winemaker account.

```ts
// When winemaker is deleted
const archiveWinemaker = await db.query.winemakers.findFirst({
  where: eq(winemakers.name, "[Archived Winemaker]")
});
await db.update(events)
  .set({ winemakerId: archiveWinemaker.id })
  .where(eq(events.winemakerId, winemakerId));
```

**Pros:**
- Events remain visible with context ("[Archived]" winemaker)
- No orphaned data
- Users see event history: "Organized by [Archived Winemaker]"
- Queries simpler (no special filtering needed)
- Event registrations remain meaningful

**Cons:**
- Need to create special archive accounts per entity type
- Queries still need to handle archive accounts differently (maybe)
- More complex admin workflow

**Impact:**
- Winemaker deletes account on April 20
- Their events reassigned to "[Archived Winemakers]" account
- Users see: "Wine Tasting organized by [Archived Winemakers]"
- Event registrations still show the event exists

---

#### **Recommendation Factors:**

| Factor | Best Option |
|--------|------------|
| **Simplicity** | A (straightforward) |
| **Audit Trail** | B or C (preserves history) |
| **User Experience** | C (shows context) |
| **Admin Workflow** | A (no archive accounts) |
| **Event Registrations** | C (more meaningful) |
| **Industry Standard** | B (most ecommerce systems) |

**Decision Factors:**
- Do event registrations need to remain meaningful? (Yes → B or C)
- Is event history important? (Yes → B or C)
- Can we live with orphaned data in DB? (Only if admin tools exist)

**Recommended:** **Option B or C** (Option A loses history; not recommended for business system)

**Note:** This decision cascades to other entities:
- User deleted → what happens to orders, reviews, comments?
- Shop Owner deleted → what happens to products, orders?
- Need to decide policy once, apply systematically

---

### **Issue C-03: Duplicate Auth Routes**

**The Problem:**
Both `/login` and `/auth/login` exist with identical functionality.

**Current State:**
```
/login            → apps/web/src/routes/login.tsx
/auth/login       → apps/web/src/routes/auth/login.tsx
/register         → apps/web/src/routes/register.tsx
/auth/register    → apps/web/src/routes/auth/register.tsx
```

**Two Options:**

#### **Option A: `/auth/*` Prefix (API-Aligned)**
Remove root-level routes, keep `/auth/login` and `/auth/register`.

**Reasoning:** API design (`docs/API/api.md`) specifies:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

Frontend routes should mirror API structure.

**Changes:**
```
DELETE: apps/web/src/routes/login.tsx
DELETE: apps/web/src/routes/register.tsx
KEEP:   apps/web/src/routes/auth/login.tsx
KEEP:   apps/web/src/routes/auth/register.tsx
```

**Pros:**
- Consistent with API design
- Clear organizational structure
- Single source of truth

**Cons:**
- Users bookmark `/login` (breaks their links)
- Navigation must update
- Redirects needed if we care about old links

---

#### **Option B: `/` Root Prefix (User-Friendly)**
Remove `/auth/*` routes, keep root-level `/login` and `/register`.

**Reasoning:** Auth is so common, it deserves root-level convenience paths.

**Changes:**
```
KEEP:   apps/web/src/routes/login.tsx
KEEP:   apps/web/src/routes/register.tsx
DELETE: apps/web/src/routes/auth/login.tsx
DELETE: apps/web/src/routes/auth/register.tsx
```

**Pros:**
- Shorter URLs (better UX)
- Users expect `/login`, not `/auth/login`
- Simpler navigation

**Cons:**
- Diverges from API design doc
- Root-level pollution (mixes auth with other routes)
- Inconsistency (API uses `/auth`, FE uses `/`)

---

#### **Recommendation:**

**Recommended: Option A (`/auth/*`)**

Reason: Better to be consistent with API design. Users can be redirected from `/login` to `/auth/login` for backward compatibility. Internal consistency trumps a few broken bookmarks.

**Implementation:**
1. Add temporary redirects: `/login` → `/auth/login`
2. Update Header/navigation to use `/auth/login`
3. Delete duplicate route files

---

## Section 2: Architectural Decisions

These shape the whole RBAC system and affect multiple modules.

---

### **Issue M-03: Role Model — Single vs. Multiple**

**The Fundamental Mismatch:**

**Design Intent** (from Role-Permission Matrix):
> User can be Customer + Winemaker + Shop Owner simultaneously

**Current Implementation** (database schema):
```sql
-- users table
role: varchar("user" | "admin")  -- SINGLE ROLE ONLY
```

**Current API Response:**
```json
{
  "id": "...",
  "role": "user",  -- Returns single string
  "fname": "...",
  "lname": "..."
}
```

**Frontend Expectation** (from dashboard code):
```tsx
<Sidebar
  userRoles={[Role.winemaker, Role.shopOwner, Role.customer]}
  activeRole={currentRole}
  onRoleChange={(newRole) => setCurrentRole(newRole)}
/>
```

Frontend has a `userRoles` array (plural) but API returns single `role` string!

---

#### **Option A: Single Role with Inheritance (Current)**

**Design:**
```
User starts as "customer"
  ↓ (admin approval)
Upgrades to "winemaker"
  ↓ (admin approval)
Can also upgrade to "shop_owner"

But at any moment: role is one value
"winemaker", "shop_owner", "customer", or "admin"
```

**Schema:**
```sql
users.role: "customer" | "winemaker" | "shop_owner" | "admin"
```

**Authorization Logic:**
```ts
// In requireRoles macro
if (!user.role === "winemaker") return 401;  // Simple string check
```

**Pros:**
- Simplest schema (no junction table needed)
- Fast authorization checks (single string comparison)
- Clear role identity ("I am a winemaker")
- Current implementation matches this

**Cons:**
- User can't be winemaker AND shop owner simultaneously
- If user switches roles, loses context of other roles
- Role-Permission Matrix designed for multi-role; doesn't match implementation
- Frontend expects array; API returns string

**Real-World Impact:**
```
User is a winemaker (created wines, hosted events)
User wants to also run a wine shop to sell their wines AND other wines
Can't do both simultaneously — must choose one role at a time
```

---

#### **Option B: Multiple Roles (Redesign)**

**Design:**
```
User has a SET of roles: ["customer", "winemaker", "shop_owner"]
Can hold multiple simultaneously
```

**Schema Changes Required:**
```sql
-- Remove from users table
ALTER TABLE users DROP COLUMN role;

-- Create junction table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  role varchar(50) NOT NULL,  -- "customer", "winemaker", "shop_owner", "admin"
  UNIQUE(user_id, role)
);

-- Or: use JSON array (simpler but less queryable)
ALTER TABLE users ADD COLUMN roles text[] DEFAULT '["customer"]';
```

**Authorization Logic:**
```ts
// In requireRoles macro
if (!user.roles.includes("winemaker")) return 401;  // Check array
```

**API Response:**
```json
{
  "id": "...",
  "roles": ["customer", "winemaker"],  // Array, not string
  "fname": "...",
  "lname": "..."
}
```

**Frontend:** Already expects this! Dashboard code uses `userRoles` array.

**Pros:**
- Matches PRD design intent (customer can be winemaker + shop owner)
- Real business use case (maker wants to also sell)
- Matches frontend expectations
- More flexible for future roles

**Cons:**
- Schema migration required (complex)
- Authorization checks more complex (includes → OR)
- More queries needed (junction table JOIN)
- Orval needs to regenerate (API contract change)

**Real-World Impact:**
```
User is now: ["customer", "winemaker", "shop_owner"]
Can switch between all three roles in one session
Can manage wines AND operate a shop selling those wines + others
```

---

#### **Option C: Role History (Hybrid)**

**Design:**
```
User has current role AND history of roles held

users.currentRole: "winemaker"
users.previousRoles: ["customer", "shop_owner"]  // JSON
```

**Pros:**
- See what roles user has held
- Can "revert" to previous role if needed
- Audit trail of role changes

**Cons:**
- Still doesn't solve simultaneous multi-role problem
- More schema complexity
- Not industry standard

---

#### **Decision Factors:**

| Factor | Best Option |
|--------|------------|
| **Matches PRD** | B (multi-role by design) |
| **Current Code** | A (single role implemented) |
| **Frontend Code** | B (expects array) |
| **Business Requirements** | B (makers want to sell) |
| **Simplicity** | A (current) |
| **Migration Cost** | A (no change) |

---

#### **Critical Follow-Up Questions:**

1. **Business Requirement:** Can a single user be both a Winemaker AND a Shop Owner simultaneously?
   - If YES → Must use Option B (multi-role)
   - If NO → Option A works fine

2. **Scope:** Are there other roles that might be multi-assignable in future?
   - If YES → Option B more future-proof
   - If NO → Option A might be sufficient

3. **Deadline:** How urgent is this?
   - Quick fix needed? → Keep Option A, update Matrix to match
   - Can redesign? → Switch to Option B

---

#### **Recommendation:**

**Review the PRD with the team:**

If PRD says "user can be customer + winemaker + shop owner simultaneously": 
→ **Must choose Option B** (multi-role), even though it requires migration

If PRD says "users can upgrade roles in sequence but hold only one at a time":
→ **Keep Option A** (single role), update Role-Permission Matrix to clarify

**This is the most important decision in this audit.** It affects:
- Database schema
- Authorization logic
- API contracts
- Frontend state management
- RBAC throughout the system

---

## Section 3: Design Refactoring Opportunities

These aren't blocking, but they'd improve code quality significantly.

---

### **D-01: Standardize Soft-Delete Pattern**

**Current State:** Inconsistent filtering across modules.

**Opportunity:** Create a reusable utility pattern.

**Implementation Option:**

```ts
// lib/db-utils.ts
export function withoutDeleted<T extends { deletedAt?: Date | null }>(
  condition: SQL
): SQL {
  return and(condition, isNull(someTable.deletedAt));
}

// Usage in repo
findMany(): Promise<Product[]> {
  return db.query.products.findMany({
    where: withoutDeleted(eq(products.categoryId, categoryId))
  });
}
```

**Benefit:** One place to add `isNull(deletedAt)`, reused everywhere.

---

### **D-02: Standardize Error Handling**

**Current State:** 100+ `throw new Error("CODE")` with mixed formats.

**Opportunity:** Create standardized error class.

```ts
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,      // "VALIDATION_ERROR", "NOT_FOUND", etc.
    public statusCode: number, // 400, 404, 500, etc.
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Usage
throw new AppError(
  "PRODUCT_NOT_FOUND",
  404,
  "Product does not exist or has been deleted"
);
```

**Benefit:** Clients can catch errors programmatically, better error messages.

---

### **D-03: Cascade Delete Policy**

**Opportunity:** Document and implement cascade policy.

**Examples:**
- User deleted → Orders kept (frozen), Reviews soft-deleted, Comments soft-deleted
- Winemaker deleted → Events soft-deleted (or orphaned), Wines soft-deleted, Reviews orphaned
- Shop deleted → Products soft-deleted, Orders kept, Bundles soft-deleted

**Benefit:** Consistent data integrity policy across all modules.

---

### **D-04: Frontend Route Reorganization**

**Opportunity:** Restructure routes with clear public/authenticated boundary.

Current:
```
routes/
├── login.tsx
├── register.tsx
├── auth/
│   ├── login.tsx
│   └── register.tsx
└── _authenticated.dashboard.tsx
```

Proposed:
```
routes/
├── __root.tsx
├── (public)/
│   ├── __layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── explore.tsx
├── (authenticated)/
│   ├── __layout.tsx
│   ├── dashboard/
│   │   ├── index.tsx
│   │   └── orders.tsx
│   └── (admin)/
│       ├── users.tsx
│       └── moderation.tsx
```

**Benefit:** Clearer structure, easier to add route guards.

---

## Section 4: Summary Table

| Issue | Type | Blocker | Complexity | Team Decision Needed |
|-------|------|---------|-----------|---------------------|
| **C-01: Deleted products in orders** | Critical | YES | Medium | A/B/C option choice |
| **C-02: Deleted winemakers in events** | Critical | YES | Medium | Cascade delete policy |
| **C-03: Duplicate auth routes** | Critical | YES | Low | A/B option choice |
| **M-01: Soft-delete consistency** | Major | NO | Low | Implementation approach |
| **M-02: Event registration checks** | Major | NO | Low | Automatic once C-02 decided |
| **M-03: Role model** | Major | YES | High | Single vs. Multi role |
| **D-01: Soft-delete utilities** | Minor | NO | Low | Nice-to-have |
| **D-02: Error handling** | Minor | NO | Medium | Nice-to-have |
| **D-03: Cascade policy doc** | Minor | NO | Low | Documentation |
| **D-04: Route structure** | Minor | NO | Medium | Nice-to-have |

---

## Next Steps

**Decisions Needed from Matej (Team Lead):**

1. **C-01 option:** Hidden (A), Placeholder (B), or Flagged (C)?
2. **C-02 option:** Cascade delete (A), Orphan with filtering (B), or Archive account (C)?
3. **C-03 option:** `/auth/*` (A) or `/login` root (B)?
4. **M-03 question:** Can users be Winemaker + Shop Owner simultaneously? (Single or Multi role?)
5. **Cascade policy:** Should we document it for all entity types?

**Next Phase:**
Once decisions are made, we can create a quick implementation plan and start fixes.

