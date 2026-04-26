# Implementation Plan — Step-by-Step Execution (2026-04-26)

Based on finalized decisions. Ready to execute.

---

## Phase 1: Quick Win (Auth Routes)

**Estimated Time:** 30 minutes  
**Blocker for:** Nothing (independent)  
**Jira Issue:** Create WINE-139 (or similar)

### Step 1.1: Delete Duplicate Auth Routes
```bash
rm apps/web/src/routes/login.tsx
rm apps/web/src/routes/register.tsx
```

### Step 1.2: Update Navigation Links
**File:** `apps/web/src/components/layout/Header.tsx`

Find: navigation/links pointing to `/login` or `/register`  
Change to: `/auth/login` and `/auth/register`

### Step 1.3: Update Any Route Redirects
**Files to check:**
- `apps/web/src/routes/__root.tsx` — Check for redirects
- `apps/web/src/components/layout/AuthLayout.tsx` — Check for redirects
- Any other components with hardcoded auth URLs

### Step 1.4: Test
```bash
bun run build
bun run check-types
```

Verify:
- [ ] Build passes
- [ ] TypeScript clean
- [ ] No broken imports

### Step 1.5: Commit
```bash
git commit -m "chore(WINE-139): consolidate auth routes to /auth/* prefix"
```

---

## Phase 2: Multiple Roles Schema & Service Layer

**Estimated Time:** 6-8 hours  
**Blocker for:** Phase 3, all RBAC features  
**Jira Issue:** Create WINE-140

### Step 2.1: Create Database Migration

**File:** `apps/server/src/db/migrations/NNNN_add_user_roles_table.sql`

```sql
-- Create junction table for roles
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create index for faster lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Migrate existing roles
INSERT INTO user_roles (user_id, role)
SELECT id, COALESCE(role, 'customer') FROM users
WHERE id NOT IN (SELECT user_id FROM user_roles);

-- Drop old column
ALTER TABLE users DROP COLUMN role;
```

### Step 2.2: Update Schema Definitions

**File:** `apps/server/src/db/schema/users.ts`

Remove this:
```ts
role: userRoleEnum("role").notNull().default("user"),
```

**File:** `apps/server/src/db/schema/index.ts`

Add:
```ts
// Create the user_roles table
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

// Add to exports
export type UserRole = typeof userRoles.$inferSelect;
```

### Step 2.3: Update Relations

**File:** `apps/server/src/db/schema/relations.ts`

Add:
```ts
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));
```

### Step 2.4: Create UserRoles Repository

**File:** `apps/server/src/modules/users/user-roles.repository.ts` (NEW)

```ts
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import type { UserRole } from "../../db/schema";
import { userRoles } from "../../db/schema";

export const userRolesRepository = {
  async findByUserId(userId: string): Promise<string[]> {
    const rows = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return rows.map(r => r.role);
  },

  async addRole(userId: string, role: string): Promise<UserRole> {
    // Check if already exists
    const existing = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.role, role))
    });
    
    if (existing) return existing;
    
    // Add new role
    const [newRole] = await db
      .insert(userRoles)
      .values({ userId, role })
      .returning();
    
    if (!newRole) throw new Error("Failed to add role");
    return newRole;
  },

  async removeRole(userId: string, role: string): Promise<void> {
    await db
      .delete(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.role, role)
      ));
  },

  async hasRole(userId: string, role: string): Promise<boolean> {
    const result = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.role, role)
      )
    });
    return !!result;
  },

  async deleteAllRoles(userId: string): Promise<void> {
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
  }
};
```

### Step 2.5: Update Auth Service

**File:** `apps/server/src/modules/auth/auth.service.ts`

Update `getUserProfile`:
```ts
async getUserProfile(userId: string) {
  const user = await usersRepository.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  
  const roles = await userRolesRepository.findByUserId(userId);
  
  return {
    ...user,
    roles,  // Now an array: ["customer", "winemaker", ...]
  };
}
```

### Step 2.6: Update Auth Routes

**File:** `apps/server/src/modules/auth/auth.routes.ts`

Update `/auth/me` response to include roles array:
```ts
.get("/me", async (context) => {
  const user = context.user;
  if (!user) return context.status(401);
  
  const profile = await authService.getUserProfile(user.id);
  return context.json(profile);
})
```

### Step 2.7: Update Authorization Macro

**File:** `apps/server/src/utils/auth.ts`

Update `requireRoles`:
```ts
export function requireRoles(...allowedRoles: string[]) {
  return function (handler: Handler) {
    return (context) => {
      const user = context.user;
      if (!user) return context.status(401);
      
      const userRoles = user.roles ?? [];  // Now array from token
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        console.warn(`User ${user.id} lacks required role. Has: ${userRoles}, needs: ${allowedRoles}`);
        return context.status(403);
      }
      
      return handler(context);
    };
  };
}
```

### Step 2.8: Update Users Repository

**File:** `apps/server/src/modules/users/users.repository.ts`

Remove any references to `role` column. Update `create`:
```ts
async create(data: CreateUserData): Promise<User> {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        clerkId: data.clerkId,
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        // No more role field here
      })
      .returning();
    
    if (!user) throw new Error("Failed to create user");
    
    // Automatically assign "customer" role to new users
    await userRolesRepository.addRole(user.id, "customer");
    
    return user;
  });
}
```

### Step 2.9: Update Seed Script

**File:** `apps/server/src/db/seed.ts`

Update to add roles for seeded users:
```ts
// After creating users
for (const user of createdUsers) {
  await db.insert(userRoles).values({
    userId: user.id,
    role: "customer"
  });
}

// For test winemakers
const winemaker = createdUsers[0];
await userRolesRepository.addRole(winemaker.id, "winemaker");
```

### Step 2.10: Regenerate API Client

```bash
bun run generate
```

This regenerates Orval hooks with new `roles: string[]` field in UserProfile.

### Step 2.11: Update Frontend Types

**File:** `apps/web/src/context/UserContext.tsx`

```ts
export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  clerkId: string;
  roles: string[];  // Changed from single "role" to array
}
```

### Step 2.12: Update Frontend Component

**File:** `apps/web/src/routes/_authenticated.dashboard.tsx`

```ts
function DashboardPage() {
  const { user } = useUser();
  
  // Get available roles from user.roles (now array)
  const availableRoles = (user?.roles ?? [])
    .map(r => stringToRole(r))
    .filter((r): r is Role => r !== undefined);
  
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    if (availableRoles.includes(Role.winemaker)) return Role.winemaker;
    if (availableRoles.includes(Role.shopOwner)) return Role.shopOwner;
    return Role.customer;
  });
  
  // ... rest of component
}
```

Helper:
```ts
function stringToRole(r: string): Role | undefined {
  const map: Record<string, Role> = {
    "winemaker": Role.winemaker,
    "shop_owner": Role.shopOwner,
    "customer": Role.customer,
  };
  return map[r];
}
```

### Step 2.13: Test Phase 2

```bash
bun run db:migrate
bun run build
bun run check-types
```

**Manual Tests Required:**
- [ ] New user registration → has "customer" role
- [ ] GET /users/me returns roles array
- [ ] Role requests still work (will be updated in next phase)
- [ ] Frontend dashboard renders available roles
- [ ] Role switching works in UI
- [ ] Authorization checks pass with array logic

### Step 2.14: Commit Phase 2

```bash
git commit -m "feat(WINE-140): implement multi-role user system with user_roles table"
```

---

## Phase 3: Deleted Products in Carts

**Estimated Time:** 2-3 hours  
**Blocker for:** Nothing (independent, but after Phase 2)  
**Jira Issue:** Create WINE-141

### Step 3.1: Update Cart Add Logic

**File:** `apps/server/src/modules/carts/carts.routes.ts`

```ts
.post("/items", async (context) => {
  const body = context.body;
  const user = context.user;
  
  // Get product
  const product = await productsRepository.findById(body.productId);
  
  // ✅ NEW CHECK: Product not deleted
  if (!product || product.deletedAt) {
    return context.status(400).json({
      error: "PRODUCT_NOT_AVAILABLE",
      message: "This product is no longer available"
    });
  }
  
  // ... rest of add logic
})
```

### Step 3.2: Update Checkout Validation

**File:** `apps/server/src/modules/orders/orders.routes.ts`

```ts
.post("/checkout", async (context) => {
  const cart = context.body;
  const user = context.user;
  
  // Validate all products still exist and not deleted
  for (const item of cart.items) {
    const product = await productsRepository.findById(item.productId);
    if (!product || product.deletedAt) {
      return context.status(400).json({
        error: "CART_ITEM_UNAVAILABLE",
        message: `Item "${item.productName}" is no longer available`,
        itemId: item.productId
      });
    }
  }
  
  // ... proceed with checkout
})
```

### Step 3.3: Frontend: Disable Add to Cart

**File:** `apps/web/src/components/product-card.tsx`

```tsx
<Button
  onClick={() => addToCart(product.id)}
  disabled={product.deletedAt !== null}  // ✅ NEW CHECK
  variant={product.deletedAt ? "outline" : "default"}
>
  {product.deletedAt ? "Product Unavailable" : "Add to Cart"}
</Button>
```

### Step 3.4: Frontend: Show Deleted Status on Orders

**File:** `apps/web/src/pages/orders.tsx`

```tsx
{order.items.map(item => (
  <div key={item.id} className={item.product.deletedAt ? "opacity-60" : ""}>
    <p>{item.product.name}</p>
    {item.product.deletedAt && (
      <span className="text-xs text-muted-foreground">
        (This product is no longer available)
      </span>
    )}
    <p>${item.unitPriceAtPurchase}</p>
  </div>
))}
```

### Step 3.5: Test Phase 3

```bash
bun run build
bun run check-types
```

**Manual Tests:**
- [ ] Adding deleted product to cart returns error
- [ ] Checkout rejects if product was deleted between add & checkout
- [ ] Orders page shows deleted products with grayed-out styling
- [ ] Add to Cart button disabled for deleted products

### Step 3.6: Commit Phase 3

```bash
git commit -m "feat(WINE-141): prevent adding deleted products to cart, show status on orders"
```

---

## Phase 4: Archive Winemaker Account & Event Protections

**Estimated Time:** 3-4 hours  
**Blocker for:** Nothing (but should happen after Phase 2)  
**Jira Issue:** Create WINE-142

### Step 4.1: Create Archive Winemaker on Startup

**File:** `apps/server/src/db/seed.ts` or **File:** `apps/server/src/app.ts`

```ts
async function ensureArchiveWinemaker() {
  const existing = await db.query.winemakers.findFirst({
    where: eq(winemakers.name, "[Archived Winemakers]")
  });
  
  if (!existing) {
    const [systemUser] = await db
      .insert(users)
      .values({
        clerkId: "system-archive",
        fname: "Archived",
        lname: "Winemakers",
        email: "noreply+archive@winejoy.local",
      })
      .returning();
    
    if (systemUser) {
      await db.insert(winemakers).values({
        userId: systemUser.id,
        name: "[Archived Winemakers]",
        description: "Account for events from deleted winemakers",
      });
    }
  }
}

// Call on app startup
await ensureArchiveWinemaker();
```

### Step 4.2: Update Winemaker Deletion Logic

**File:** `apps/server/src/modules/winemakers/winemakers.service.ts`

```ts
async deleteWinemaker(winemakerId: string) {
  const now = new Date();
  
  // Get archive winemaker ID
  const archive = await db.query.winemakers.findFirst({
    where: eq(winemakers.name, "[Archived Winemakers]"),
    columns: { id: true }
  });
  
  if (!archive) throw new Error("ARCHIVE_WINEMAKER_NOT_FOUND");
  
  // Reassign all events to archive
  await db.update(events)
    .set({ winemakerId: archive.id })
    .where(eq(events.winemakerId, winemakerId));
  
  // For future events: void registrations and mark cancelled
  const futureEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(
      and(
        eq(events.winemakerId, winemakerId),
        gte(events.startTime, now)
      )
    );
  
  for (const event of futureEvents) {
    // Delete all registrations
    await db
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.eventId, event.id));
    
    // Mark event as cancelled
    await db
      .update(events)
      .set({ status: "cancelled" })
      .where(eq(events.id, event.id));
  }
  
  // Soft delete the winemaker
  await db
    .update(winemakers)
    .set({ deletedAt: now })
    .where(eq(winemakers.id, winemakerId));
  
  // Also soft delete user if they have no other roles
  const remainingRoles = await userRolesRepository.findByUserId(
    winemaker.userId
  );
  if (remainingRoles.length === 1 && remainingRoles[0] === "winemaker") {
    // Only had winemaker role, can delete user
    // OR: keep user, just remove winemaker role
    // Decision: Remove winemaker role, keep user account
    await userRolesRepository.removeRole(winemaker.userId, "winemaker");
  }
}
```

### Step 4.3: Update Event Registration Service

**File:** `apps/server/src/modules/events/events.service.ts`

```ts
async registerForEvent(eventId: string, userId: string) {
  const event = await eventsRepository.findById(eventId);
  const now = new Date();
  
  if (!event) throw new Error("EVENT_NOT_FOUND");
  if (event.deletedAt) throw new Error("EVENT_DELETED");
  
  // For future events, check if winemaker is deleted
  if (event.startTime > now) {
    const winemaker = await winemakersRepository.findById(event.winemakerId);
    if (winemaker?.deletedAt) {
      throw new Error("EVENT_CANCELLED_ORGANIZER_DELETED");
    }
  }
  
  // Continue with registration
  return eventsRepository.createRegistration(eventId, userId, event.capacity);
}
```

### Step 4.4: Update Event Routes

**File:** `apps/server/src/modules/events/events.routes.ts`

Handle the new error:
```ts
.post("/:eventId/register", requireAuth(), async (context) => {
  try {
    const registration = await eventsService.registerForEvent(
      context.params.eventId,
      context.user.id
    );
    return context.json(registration);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "EVENT_CANCELLED_ORGANIZER_DELETED":
          return context.status(410).json({
            error: "EVENT_CANCELLED",
            message: "This event has been cancelled (organizer account deleted)"
          });
        case "ALREADY_REGISTERED":
          return context.status(409).json({
            error: "ALREADY_REGISTERED",
            message: "You are already registered for this event"
          });
        case "CAPACITY_FULL":
          return context.status(400).json({
            error: "CAPACITY_FULL",
            message: "This event is full"
          });
      }
    }
    throw error;
  }
})
```

### Step 4.5: Frontend: Show Archive Account Label

**File:** `apps/web/src/pages/event-detail.tsx`

```tsx
<div className="event-header">
  <h1>{event.name}</h1>
  {event.winemaker.name === "[Archived Winemakers]" ? (
    <p className="text-muted-foreground">
      Organized by [Archived] (organizer account deleted)
    </p>
  ) : (
    <Link to={`/winemakers/${event.winemaker.id}`}>
      By {event.winemaker.name}
    </Link>
  )}
</div>

{event.status === "cancelled" && (
  <Alert variant="destructive">
    <AlertTitle>This event has been cancelled</AlertTitle>
    <AlertDescription>
      The organizer has deleted their account. All registrations have been voided.
    </AlertDescription>
  </Alert>
)}
```

### Step 4.6: Test Phase 4

```bash
bun run build
bun run check-types
```

**Manual Tests:**
- [ ] Archive winemaker account created on startup
- [ ] Deleting winemaker reassigns events to archive
- [ ] Future event registrations voided
- [ ] Attempting to register for cancelled event returns 410
- [ ] Frontend shows archive account label
- [ ] Past events still visible but organized by [Archived]

### Step 4.7: Commit Phase 4

```bash
git commit -m "feat(WINE-142): implement archive winemaker account and event cancellation on deletion"
```

---

## Testing Checklist

After all phases complete, run full test suite:

```bash
bun run build      # Should pass
bun run check-types # Should pass
bun run lint       # Should pass
```

**E2E Testing Required:**
- [ ] New user flow: register → has customer role
- [ ] Admin approves winemaker request → user has winemaker role
- [ ] User can switch roles in dashboard
- [ ] Adding deleted product disabled in UI, rejected in API
- [ ] Deleted product shows in old order with grayed styling
- [ ] Winemaker deleted → events reassigned to archive
- [ ] Future event registrations voided and marked cancelled
- [ ] Past events still visible under [Archived] account
- [ ] All auth routes work at `/auth/login`, `/auth/register`
- [ ] Old `/login`, `/register` routes deleted

---

## Timeline Estimate

- **Phase 1:** 30 min (Quick win)
- **Phase 2:** 6-8 hours (Foundation)
- **Phase 3:** 2-3 hours (Cart/Orders)
- **Phase 4:** 3-4 hours (Events)
- **Testing:** 2-3 hours
- **Total:** ~14-19 hours

**Recommended:** Spread across 2-3 days to allow for testing between phases.

**Execution Order:**
1. Phase 1 (today) — Quick win, no dependencies
2. Phase 2 (tomorrow) — Foundation for everything else
3. Phase 3 (tomorrow PM) — Once Phase 2 verified
4. Phase 4 (day 3) — Once Phase 2 stable

