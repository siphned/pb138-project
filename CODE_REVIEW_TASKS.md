# Code Review Findings - Task Breakdown

## Overview
Comprehensive code audit of Winery project identified 12 major issues across architecture, type safety, error handling, and testing.

**Scorecard:**
- Backend Architecture: A-
- Frontend Structure: A
- Error Handling: C (critical issue)
- Type Safety: C+ (multiple unsafe casts)
- Testing: B (good coverage, weak depth)
- Security: B (auth checks present)
- Code Quality: B

---

## CRITICAL ISSUES (Blocks Production)

### WINE-141: Fix Silent Error Handling
**Branch:** `fix/WINE-141-silent-error-handling`  
**Files:** 
- `apps/server/src/modules/orders/orders.service.ts` (line 66-68)
- `apps/server/src/modules/auth/auth.utils.ts` (line 28)

**Problem:**
```typescript
.catch(() => { /* ignore */ })  // Silent failures
```
Users/admins never know when critical operations fail (email, JWT verification).

**Fix:**
- Log errors to monitoring service
- Don't silently ignore failures
- Add proper error context (user, operation, timestamp)

---

### WINE-142: Remove Unsafe Type Casts
**Branch:** `fix/WINE-142-remove-unsafe-casts`  
**Files:**
- `apps/server/src/modules/carts/carts.repository.ts`
- `apps/server/src/modules/orders/orders.repository.ts`
- `apps/server/src/modules/products/products.repository.ts`

**Problem:**
```typescript
const typedCart = cart as unknown as CartWithItems;  // Bypasses type checking
```

**Fix:**
- Let Drizzle provide proper types
- Remove `as unknown` casts
- Add proper type inference

---

### WINE-143: Add Database Transactions to Checkout
**Branch:** `fix/WINE-143-transaction-checkout`  
**File:** `apps/server/src/modules/orders/orders.service.ts` (createOrder method)

**Problem:**
Multiple DB operations without transaction:
1. Create order
2. Create order items
3. Update inventory
4. Clear cart

If step 3 fails, inventory updated but order not created = inconsistent state.

**Fix:**
- Wrap entire checkout flow in Drizzle transaction
- Ensure all-or-nothing semantics

---

### WINE-144: Validate Cart Items Before Checkout
**Branch:** `fix/WINE-144-validate-cart-items`  
**File:** `apps/server/src/modules/orders/orders.service.ts` (line 89)

**Problem:**
```typescript
if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");
// But doesn't check if items are deleted/unavailable
```

**Fix:**
- Validate each cart item exists
- Check inventory levels
- Reject deleted/soft-deleted products
- Validate bundles have required items

---

## MAJOR ISSUES (Should Fix Before Release)

### WINE-145: Type Validate useRoles Hook
**Branch:** `fix/WINE-145-useRoles-validation`  
**File:** `apps/web/src/hooks/useRoles.ts`

**Problem:**
```typescript
return (sessionClaims?.roles as AppRole[]) ?? [];  // Unsafe cast
```
Clerk claims could contain invalid roles not in AppRole enum.

**Fix:**
- Validate with Zod schema
- Parse before returning

---

### WINE-146: Add Error Logging to Routes
**Branch:** `fix/WINE-146-error-logging`  
**Scope:** All route files in `apps/server/src/modules/*/`

**Problem:**
Routes catch errors but don't log them. Makes production debugging impossible.

**Fix:**
- Add logger middleware
- Log: message, stack, request context (user, endpoint)
- Use consistent log format
- Include request IDs for tracing

---

### WINE-147: Standardize Error Naming
**Branch:** `fix/WINE-147-standardize-errors`  
**Scope:** All service files

**Problem:**
Inconsistent error names across modules:
- `NOT_FOUND`, `FORBIDDEN` (uppercase)
- `PRODUCT_DELETED`, `BUNDLE_MIN_WINES` (mixed)
- `CART_EMPTY`, `INVALID_WINE` (mixed)

**Fix:**
- Choose pattern: `ALL_CAPS` recommended
- Apply consistently across all modules
- Update route error handlers to match

---

### WINE-148: Validate Environment Variables at Startup
**Branch:** `fix/WINE-148-env-validation`  
**File:** `apps/server/src/app.ts` or new `config.ts`

**Problem:**
No centralized ENV validation. Variables checked in code scattered.

**Fix:**
```typescript
const envSchema = z.object({
  CLERK_JWT_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

Fail fast at startup if vars missing.

---

## MAJOR ISSUES (Testing)

### WINE-149: Add Integration Tests
**Branch:** `test/WINE-149-integration-tests`  
**Scope:** `apps/server/src/__tests__/integration/`

**Problem:**
Unit tests mock everything. Real checkout flow untested.

**Fix:** Add 5-8 integration tests:
- Guest checkout
- Authenticated checkout
- Cart merging on login
- Inventory allocation
- Multi-shop orders
- Address freezing

Use real DB fixture or transactions that rollback.

---

### WINE-150: Fix Soft Delete Queries
**Branch:** `fix/WINE-150-soft-delete-queries`  
**Scope:** All repository files

**Problem:**
Products use soft deletes but queries don't filter `deletedAt IS NULL`:
- `getCatalog()` returns deleted products
- Cart items include deleted products
- Search includes deleted wines

**Fix:**
- Add `WHERE deletedAt IS NULL` to all relevant queries
- Create helper: `excludeDeleted()`
- Test that deleted items don't appear

---

### WINE-151: Add Rate Limiting
**Branch:** `fix/WINE-151-rate-limiting`  
**File:** `apps/server/src/app.ts` or middleware

**Problem:**
No rate limiting on endpoints. Vulnerable to abuse/DoS.

**Fix:**
- Add rate limit middleware
- Default: 100 req/min per IP
- Stricter for auth: 5 failed logins/min
- Stricter for checkout: 10 orders/hour per user

---

## TESTING BACKLOG

### WINE-152: Add E2E Tests for Critical Flows
**Branch:** `test/WINE-152-e2e-tests`  
**Scope:** `apps/web/src/__tests__/e2e/`

**Problem:**
Only 22 E2E tests. Missing critical flows.

**Fix:** Add 10+ tests:
- Full guest checkout (cart → address → payment → confirm)
- Authenticated checkout
- Cart management (add, update, remove)
- Product filtering/search
- User profile updates
- Role transitions
- Wishlist functionality

---

## Implementation Guide

Each branch should:
1. Address the specific issue
2. Add tests for the fix
3. Update docs if applicable
4. Follow commit format: `fix(WINE-XXX): description`
5. Create PR to `dev` with description
6. Request review before merge
