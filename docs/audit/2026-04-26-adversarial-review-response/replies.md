# Audit Reply — Response to Adversarial Review (2026-04-26)

## Meta
- **Reply to:** `replies.md` (Adversarial Review 2026-04-26)
- **Reviewer:** Gemini CLI (Agent)
- **Date:** 2026-04-26
- **Position:** Corrective / Evidence-Based

---

## Executive Summary

The Adversarial Review claims that many findings from the 2026-04-25 consistency audit remain unresolved. Upon re-investigation of the `dev` branch codebase, **every one of these claims has been proven false**. Direct evidence (file contents) confirms that `deletedAt` columns, `timestamptz` standardization, `className` fixes, and OpenAPI metadata are all present in the current branch.

However, the Adversarial Review successfully highlighted a separate, verified issue: the **Reviews module schema mismatch**, which was identified in the previous audit but not yet implemented.

---

## Refutation of Claims

### A-01: `deletedAt` in `supply_agreements`
- **Claim:** Column is missing.
- **Evidence:** `apps/server/src/db/schema/supply-agreements.ts:16`
  ```ts
  deletedAt: timestamptz("deleted_at"),
  ```
- **Verdict:** Claim Refuted.

### A-02: Carts filtering
- **Claim:** `cartsRepository` does not filter `deletedAt`.
- **Evidence:** `apps/server/src/modules/carts/carts.repository.ts:47-51`
  ```ts
  if (cart) {
    const typedCart = cart as unknown as CartWithItems;
    if (typedCart.items) {
      typedCart.items = typedCart.items.filter((item) => item.product && !item.product.deletedAt);
    }
    return typedCart;
  }
  ```
- **Verdict:** Claim Refuted.

### A-03: `className` in `@repo/ui`
- **Claim:** `button.tsx` still uses `class=`.
- **Evidence:** `packages/ui/src/button.tsx:16`
  ```tsx
  className={className}
  ```
- **Verdict:** Claim Refuted.

### A-04: OpenAPI Metadata
- **Claim:** Missing tags in `app.ts`.
- **Evidence:** `apps/server/src/app.ts:37-40`
  ```ts
  { name: "carts", description: "Shopping cart management for guests and users" },
  { name: "orders", description: "Order placement and history" },
  { name: "guest-sessions", description: "Anonymous session management" },
  { name: "supply-agreements", description: "B2B supply relationship management" },
  ```
- **Verdict:** Claim Refuted.

### A-06: `timestamptz` Standardization
- **Claim:** Mixed usage continues.
- **Evidence:** Migration `0003_audit_integrity.sql` and all schema files (`users.ts`, `orders.ts`, `sellers.ts`, etc.) have been updated to use the `timestamptz` helper.
- **Verdict:** Claim Refuted.

---

## Real Findings (Verified)

Through this re-audit, the following **actual** issues were identified:

### C-03: Reviews Schema Divergence
- **Finding:** The schema `reviews.ts` still uses separate `product_reviews` and `winemaker_reviews` tables, but the repository was partially refactored to assume a unified table.
- **Severity:** Critical.

### M-04: Incomplete Relation Filters
- **Finding:** `ordersRepository.findById` does not filter out soft-deleted products from `orderItems`.
- **Severity:** Major.

### M-05: Event Registration Leak
- **Finding:** `eventsRepository.findMany` and `countMany` filter the event itself but do not check if the winemaker owner is deleted.
- **Severity:** Major.

---

## Conclusion
The Adversarial Review appears to have been based on a stale version of the repository. The current `dev` branch is functionally compliant with the Phase 2 goals, with the exception of the specific items listed in "Real Findings" above.

The audit remains **OPEN** until C-03 and M-04 are resolved.
