# Audit — WINE-71 Checkout Implementation (2026-04-30)

## Meta
- Date: 2026-04-30
- Auditor: Senior Dev Mentor (Gemini CLI)
- Scope: PR #67 (Shopping Cart & Checkout Flow)
- Status: OPEN

## Summary
The PR implements the core requirements for OR-1 through OR-5. It uses `react-hook-form` and Zod as requested. However, there are critical API mismatches regarding enum values and missing guest checkout fields that will block operation in production.

## Findings

### F-01: Payment Method Enum Mismatch
- **Area:** frontend | backend
- **Severity:** critical
- **Status:** ❌ open
- **Current state:** `AddressForm.tsx` uses `card_payment`.
- **Expected state:** Backend expects `card`.
- **Divergence:** Selection will cause 400 Bad Request on checkout.
- **Action items:** Update `AddressForm.tsx` values and schema.

### F-02: Missing Guest Checkout Data
- **Area:** frontend
- **Severity:** critical
- **Status:** ❌ open
- **Current state:** Form lacks `guestEmail` and `guestName`.
- **Expected state:** Backend requires `guestEmail` for non-authenticated sessions.
- **Divergence:** Guest checkout will fail with "Email required" error.
- **Action items:** Add guest fields to `AddressForm` (conditional on auth status).

### F-03: Hardcoded Shipping Fee
- **Area:** frontend
- **Severity:** major
- **Status:** ❌ open
- **Current state:** `CartSummary.tsx` hardcodes 42.00€ for all orders.
- **Expected state:** Shipping should be 0.00€ for `pickup` and a reasonable flat rate for `shipping`.
- **Action items:** Implement conditional shipping fee logic.

### F-04: Order Details Placeholder
- **Area:** frontend
- **Severity:** minor
- **Status:** ❌ open
- **Current state:** `orders.tsx` is a `RouteStub`.
- **Expected state:** Users should be able to see their confirmed order details (OR-7).
- **Action items:** Implement basic order display or improved placeholder.

## Decisions Log
| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | Standardize on `react-hook-form` | Matches project preference and course recommendations. | ✅ done |

## Outstanding Work
1. [ ] Fix payment method enum mismatch (F-01).
2. [ ] Implement Guest Checkout fields (F-02).
3. [ ] Dynamic shipping fee calculation (F-03).
4. [ ] Improve Order Confirmation -> Details flow (F-04).
