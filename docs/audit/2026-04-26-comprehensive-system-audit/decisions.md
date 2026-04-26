# Decisions Log — Design Choices (2026-04-26)

**Decision Maker:** Matej Šinogl (Team Lead)  
**Date:** 2026-04-26  
**Status:** FINALIZED — Ready for implementation

---

## Critical Path-Blocking Decisions

### **D1: Deleted Products in Order History**

**Decision:** Show product normally. Prevent deletion at cart/checkout via disabled button.

**Rationale:**
- Soft-delete semantics: data exists in DB, just marked as deleted
- Show what user actually purchased (historical accuracy)
- Only prevent *future* purchases via disabled Add to Cart button
- Non-destructive: users can always see what they bought

**Implementation:**
- ✅ NO change to `ordersRepository.findById` (keep returning all products)
- ✅ Frontend: Check `product.deletedAt` → disable "Add to Cart" button
- ✅ Checkout: Validate at submit time (reject if product is deleted)
- ✅ Orders page: Display products as-is (no placeholders needed)

**Affected Files:**
- `apps/web/src/components/product-card.tsx` — Disable add-to-cart for deleted
- `apps/server/src/modules/carts/carts.routes.ts` — Validate product not deleted on add
- `apps/server/src/modules/orders/orders.routes.ts` — Validate all items not deleted on checkout

**Effort:** 2-3 hours

**Related:** None blocking

---

### **D2: Deleted Winemakers' Events**

**Decision:** Option C (Archive Account) + Future Event Protections

**Rationale:**
- Keep event history visible (shows "[Archived Winemakers]" account)
- Prevent further registrations for future events
- Void all registrations for future events (can't attend if organizer deleted)
- Maintain audit trail

**Implementation Details:**

#### **Part A: Create Archive Account**
```sql
INSERT INTO winemakers (user_id, name, description, deletedAt)
VALUES (null, '[Archived Winemakers]', 'Account for deleted winemaker events', null);
```

#### **Part B: Winemaker Deletion Flow**
When a winemaker is deleted:
1. Reassign all their events to the Archive account
2. For **future events**: 
   - Mark as "cancelled" or special status
   - Delete all registrations (void them)
   - Send notification to registered users
3. For **past events**: 
   - Leave as-is (happened, can't change history)

```ts
// In winemakers.service.ts
async deleteWinemaker(winemakerId: string) {
  const archiveId = await getArchiveWinemakerAccount();
  const now = new Date();

  // Reassign all events to archive
  await db.update(events)
    .set({ winemakerId: archiveId })
    .where(eq(events.winemakerId, winemakerId));

  // For future events: void registrations
  const futureEvents = await db.query.events.findMany({
    where: and(
      eq(events.winemakerId, winemakerId),
      gte(events.startTime, now)
    ),
    columns: { id: true }
  });

  for (const event of futureEvents) {
    // Delete all registrations for this event
    await db.delete(eventRegistrations)
      .where(eq(eventRegistrations.eventId, event.id));
    
    // Optionally: mark event as cancelled
    await db.update(events)
      .set({ status: 'cancelled' })
      .where(eq(events.id, event.id));
  }

  // Soft delete the winemaker
  await db.update(winemakers)
    .set({ deletedAt: new Date() })
    .where(eq(winemakers.id, winemakerId));
}
```

#### **Part C: Query Changes**
```ts
// eventsRepository.findMany (already correct for past events)
// Just needs to handle Archive account specially in UI

// eventRegistrations.service.ts
async registerForEvent(eventId: string, userId: string) {
  const event = await eventsRepository.findById(eventId);
  
  // Check 1: Event not deleted
  if (event.deletedAt) throw new Error("EVENT_DELETED");
  
  // Check 2: If future event, winemaker not deleted
  if (event.startTime > now && event.winemaker.deletedAt) {
    throw new Error("EVENT_CANCELLED_ORGANIZER_DELETED");
  }
  
  // ... continue registration
}
```

**Affected Files:**
- `apps/server/src/db/seed.ts` — Create archive winemaker on startup
- `apps/server/src/modules/winemakers/winemakers.service.ts` — Deletion logic
- `apps/server/src/modules/events/events.service.ts` — Registration validation
- `apps/web/src/pages/events.tsx` — Show "[Archived]" label for archive account

**Effort:** 3-4 hours

**Related:** M-02 (event registration checks) resolved by this

**Note:** Apply same pattern to other entities later:
- User deletion → void pending orders, archive reviews
- Shop deletion → archive products, void orders

---

### **D3: Auth Route Paths**

**Decision:** Move to `/auth/*` prefix. Remove duplicate root-level routes.

**Rationale:**
- Consistent with API design (`docs/API/api.md`)
- Single source of truth
- Can add redirects for backward compatibility if needed

**Implementation:**
```
DELETE: apps/web/src/routes/login.tsx
DELETE: apps/web/src/routes/register.tsx
KEEP:   apps/web/src/routes/auth/login.tsx
KEEP:   apps/web/src/routes/auth/register.tsx
```

**Changes:**
- Update Header/navigation links to use `/auth/login`
- Update any hardcoded redirect routes
- Optional: Add middleware redirect `/login` → `/auth/login` for backward compat

**Affected Files:**
- `apps/web/src/routes/login.tsx` — DELETE
- `apps/web/src/routes/register.tsx` — DELETE
- `apps/web/src/components/layout/Header.tsx` — Update links
- `apps/web/src/routes/__root.tsx` — Update any redirects

**Effort:** 30 minutes

**Related:** None blocking

---

### **D4: Role Model — Multiple Roles**

**Decision:** Option B — Users can hold multiple roles simultaneously.

**Rationale:**
- Matches PRD design intent
- Real business case: winemaker wants to run a shop selling their wines + others
- Frontend code already expects this (has `userRoles` array)
- Enables role-switching within same session

**Major Changes Required:**

#### **Part A: Database Schema Changes**
```sql
-- Step 1: Create user_roles junction table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  role varchar(50) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Step 2: Migrate data from users.role → user_roles
-- All users start with "customer" role
INSERT INTO user_roles (user_id, role)
SELECT id, COALESCE(role, 'customer') FROM users;

-- Step 3: Drop single role column
ALTER TABLE users DROP COLUMN role;
```

#### **Part B: Schema Type Changes**
```ts
// db/schema/users.ts
export const users = pgTable("users", {
  // ... existing fields ...
  // REMOVED: role: userRoleEnum("role").notNull().default("user"),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
}));
```

#### **Part C: Service Layer Updates**
```ts
// auth.service.ts
async getUserProfile(userId: string) {
  const user = await usersRepository.findById(userId);
  const roles = await userRolesRepository.findByUserId(userId);
  
  return {
    ...user,
    roles: roles.map(r => r.role),  // ["customer", "winemaker", "shop_owner"]
  };
}

// API response schema
const UserProfile = z.object({
  id: z.string().uuid(),
  fname: z.string(),
  lname: z.string(),
  email: z.string().email(),
  clerkId: z.string(),
  roles: z.array(z.enum(['customer', 'winemaker', 'shop_owner', 'admin'])),
});
```

#### **Part D: Authorization Macro Updates**
```ts
// utils/auth.ts
export function requireRoles(...allowedRoles: Role[]) {
  return function (handler: Handler) {
    return (context) => {
      const user = context.user;  // From Clerk JWT
      if (!user) return context.status(401);
      
      const userRoles = user.roles;  // Now an array
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) return context.status(403);
      return handler(context);
    };
  };
}
```

#### **Part E: Repository Layer**
```ts
// modules/users/users.repository.ts
export const userRolesRepository = {
  async findByUserId(userId: string): Promise<string[]> {
    const rows = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      columns: { role: true }
    });
    return rows.map(r => r.role);
  },

  async addRole(userId: string, role: string): Promise<void> {
    await db.insert(userRoles)
      .values({ userId, role })
      .onConflict(/*ignore duplicate*/)
      .run();
  },

  async removeRole(userId: string, role: string): Promise<void> {
    await db.delete(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.role, role)
      ));
  }
};
```

#### **Part F: Orval Regeneration**
```bash
bun run generate
```
This will regenerate `apps/web/src/generated/users/users.ts` with new API contracts.

#### **Part G: Frontend Updates**
```tsx
// apps/web/src/context/UserContext.tsx
export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  clerkId: string;
  roles: string[];  // Changed from single role to array
}

// apps/web/src/routes/_authenticated.dashboard.tsx
function DashboardPage() {
  const { user } = useUser();  // user.roles is now array
  const [currentRole, setCurrentRole] = useState<Role>(
    () => user.roles.includes("winemaker") ? Role.winemaker : Role.customer
  );
  
  // Can now switch between any role user has
  const availableRoles = user.roles.map(roleStringToEnum);
}
```

**Affected Files:**
- `apps/server/src/db/schema/users.ts` — Remove role, create userRoles table
- `apps/server/src/db/schema/relations.ts` — Add usersRelations
- `apps/server/src/db/migrations/` — New migration file
- `apps/server/src/modules/auth/auth.service.ts` — Fetch roles array
- `apps/server/src/modules/users/users.repository.ts` — Add userRolesRepository
- `apps/server/src/utils/auth.ts` — Update requireRoles macro
- `apps/web/src/context/UserContext.tsx` — Update UserProfile interface
- `apps/web/src/routes/_authenticated.dashboard.tsx` — Handle roles array
- All route handlers using `requireRoles` (will need re-testing)

**Effort:** 6-8 hours

**Related:** This is foundational. Several routes depend on it working correctly.

**Risk:** High-impact change. Needs thorough testing of:
- User registration (create customer role)
- Role requests (add winemaker/shop_owner role)
- Authorization checks (all @requireRoles decorators)
- Frontend role-switching

**Testing Required:**
- [ ] New user registers → has ["customer"] role
- [ ] Customer requests winemaker → has ["customer", "winemaker"]
- [ ] Admin approves shop owner → has ["customer", "winemaker", "shop_owner"]
- [ ] Role-based routes work (GET /winemaker/* requires winemaker role)
- [ ] Frontend dashboard switches between roles correctly
- [ ] Authorization guards work with array of roles

---

## Implementation Sequence

**Phase 1 (Quickest Wins):**
1. D3 (Auth routes) — 30 min
2. D1 (Deleted products in carts) — 2-3 hours
3. Commit & test

**Phase 2 (Related to Multi-Role):**
4. D4 (Multiple roles schema) — 6-8 hours
5. Orval regeneration
6. Test all auth flows

**Phase 3 (Event-Specific):**
7. D2 (Archive winemaker account) — 3-4 hours
8. Test event registration/cancellation flows

**Total Effort:** ~12-15 hours

**Recommended Sequence:** Do them in order (Phase 1 → 2 → 3) because:
- Phase 1 is quick win, doesn't conflict with others
- Phase 2 must happen before Phase 3 (events depend on users)
- Phase 3 builds on Phase 2

---

## Revision History

- **2026-04-26** — All decisions finalized by Matej Šinogl

