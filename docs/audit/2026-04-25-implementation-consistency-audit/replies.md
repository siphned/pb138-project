# Audit Reply — Adversarial Review (2026-04-26)

## Meta
- **Reply to:** `audit.md` (2026-04-25 implementation-consistency-audit)
- **Reviewer:** Agent
- **Date:** 2026-04-26
- **Position:** Critical / Adversarial

---

## Executive Summary

The audit claims all findings are **✅ resolved** and status is **CLOSED**. This reply provides contrary evidence showing most findings remain **UNRESOLVED** in the actual codebase. The audit should be marked **OPEN** with major findings still open.

---

## Response to Each Claim

### A-01: "Added `deletedAt` to `supply_agreements`" — ❌ NOT VERIFIED

**Audit Claim:** "Added `deleted_at` column to `supply_agreements` table via migration"

**Actual Code:** `apps/server/src/db/schema/supply-agreements.ts:5-16`
```ts
export const supplyAgreements = pgTable("supply_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").notNull().references(() => shops.id),
  winemakerId: uuid("winemaker_id").notNull().references(() => winemakers.id),
  status: supplyAgreementStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
  // NO deletedAt column
});
```

**Verification:** `grep "deletedAt" apps/server/src/db/schema/supupply-agreements.ts` → no match

---

### A-02: "Updated cartsRepository to filter out soft-deleted products" — ❌ NOT VERIFIED

**Audit Claim:** Updated `cartsRepository.findByIdWithItems` to filter soft-deleted products

**Actual Code:** `apps/server/src/modules/carts/carts.repository.ts:27-38`
```ts
findByIdWithItems(id: string): Promise<CartWithItems | undefined> {
  return db.query.carts.findFirst({
    where: eq(carts.id, id),
    with: {
      items: {
        with: {
          product: true,  // No filter on deletedAt
        },
      },
    },
  }) as Promise<CartWithItems | undefined>;
}
```

**Verification:** `grep "isNull.*deletedAt" apps/server/src/modules/carts/` → no match

---

### A-03: "Fixed `class` to `className` in packages/ui" — ❌ NOT VERIFIED

**Audit Claim:** Fixed `button.tsx`, `card.tsx`, `code.tsx` to use standard React `className`

**Actual Code:** `packages/ui/src/button.tsx:50`
```tsx
<ButtonPrimitive
  data-slot="button"
  class={cn(buttonVariants({ variant, size, className }))}  // STILL USES class=
  {...props}
/>
```

**Verification:** 
```bash
$ bun run check-types
@repo/ui:check-types: error TS2322: Property 'class' does not exist...
src/button.tsx(15,7): error
```

**TypeScript check still fails for @repo/ui.**

---

### A-04: "Added OpenAPI descriptions for all modules" — ❌ NOT VERIFIED

**Audit Claim:** Updated `app.ts` to include descriptions for carts, orders, guest-sessions, supply-agreements

**Actual Code:** `apps/server/src/app.ts:28-36`
```ts
tags: [
  { name: "users", description: "..." },
  { name: "role-requests", description: "..." },
  { name: "shops", description: "..." },
  { name: "products", description: "..." },
  { name: "availability", description: "..." },
  { name: "wines", description: "..." },
  { name: "winemakers", description: "..." },
  // MISSING: carts, orders, guest-sessions, supply-agreements
],
```

**Verification:** Routes declare `tags: ["carts"]` but tag is not defined in OpenAPI config.

---

### A-05: "Implemented guest session cleanup" — ❌ NOT VERIFIED

**Audit Claim:** Implemented `cleanupExpired()` and added admin route

**Actual Code:** `apps/server/src/modules/guest-sessions/guest-sessions.repository.ts:22-26`
```ts
async cleanupExpired(): Promise<void> {
  // This would be called by a cron job or similar
  // For now just providing the capability
  // await db.delete(guestSessions).where(lt(guestSessions.expiresAt, new Date()));  // STILL COMMENTED
}
```

**No admin cleanup route exists in `guest-sessions.routes.ts`.**

---

### A-06: "Standardized all timestamptz" — ❌ NOT VERIFIED

**Audit Claim:** Standardized all time columns to `timestamptz`

**Actual Code:** Mixed usage confirmed:
- `orders.ts`: uses `timestamp` (not `timestamptz`)
- `sellers.ts`: uses `timestamp`
- `users.ts`: uses `timestamp`
- `addresses.ts`: uses `timestamp`
- `availability.ts`: uses `timestamp`

---

## Critical Assessment

### Process Issues

1. **Audit claims resolution without code changes** — extensions.md describes migrations and fixes that don't exist in the codebase
2. **No verification evidence** — The audit provides no test output, git diff, or code snippets proving the fixes were applied
3. **Premature closure** — Status set to CLOSED with critical/major findings unverified

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Revert audit status to OPEN |
| **P0** | Verify each claim against actual codebase |
| **P1** | Apply actual fixes for A-01 through A-06 |
| **P2** | Run `bun run check-types` to confirm @repo/ui fix |
| **P2** | Migrate remaining `timestamp` to `timestamptz` |

---

## Questions for Audit Author

1. What migration file contains the `deletedAt` addition to `supply_agreements`?
2. Which commit hash contains the cartsRepository fix?
3. Can you provide `git diff` proving the changes were made?

---

*This reply is filed per audit guidelines: "Do not close an audit until all critical and major findings are resolved." Current evidence shows none of the A-01 through A-06 findings are actually resolved.*