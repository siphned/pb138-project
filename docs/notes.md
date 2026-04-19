# Project Notes

## Orders — Address Freezing

When creating an order, always insert new rows into the `Addresses` table for both shipping and billing — never reuse existing address IDs from the user's profile.

**Why:** The address must be frozen at the point of order placement. If the user later changes their saved address, the order must still reflect the address used at purchase time.

## Role Upgrade — Winemaker / Shop Owner

When a user submits a role request (AU-6/AU-7), no `Winemakers` or `Shops` record is created yet. The request is stored separately and reviewed by an admin.

Only on admin approval are the corresponding records created and the user's role updated. On rejection, nothing is created and the user is notified by email.

**Why:** Prevents partial/orphaned records for rejected applicants, and keeps the data model clean — a `Shops` or `Winemakers` record always means an active, approved entity.

## Guest Cart — localStorage

Unauthenticated users can add items to their cart (OR-1). The `Carts` table has a `user_id` FK, so a guest cart cannot be persisted in the database.

**Solution:** Store the guest cart in `localStorage` on the frontend. On login/registration, merge the localStorage cart into the user's database cart before redirecting to checkout.

**Things to handle:** duplicate products (add quantities), stock availability check after merge, clearing localStorage after merge.

## Images — Polymorphic Association

`Images` uses an `entity_type` + `entity_id` pattern instead of separate FK columns per entity. There is no database-level FK enforcement. Valid `entity_type` values and the constraint that `entity_id` must reference an existing record must be enforced at the application level.
