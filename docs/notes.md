# Project Notes

## Orders — Address Freezing

When creating an order, always insert new rows into the `Addresses` table for both shipping and billing — never reuse existing address IDs from the user's profile.

**Why:** The address must be frozen at the point of order placement. If the user later changes their saved address, the order must still reflect the address used at purchase time.

## Role Upgrade — Winemaker / Shop Owner

When a user submits a role request (AU-6/AU-7), no `Winemakers` or `Shops` record is created yet. The request is stored separately and reviewed by an admin.

Only on admin approval are the corresponding records created and the user's role updated. On rejection, nothing is created and the user is notified by email.

**Why:** Prevents partial/orphaned records for rejected applicants, and keeps the data model clean — a `Shops` or `Winemakers` record always means an active, approved entity.

## Guest Cart — Server-side Anonymous Sessions

Unauthenticated users can add items to their cart (OR-1). The cart is stored in the database and associated with a `guest_session_id`.

**Solution:** On the first cart action by a guest, the backend creates a `guest_session` record and returns a session cookie. Cart items in the DB reference this session ID.

**Login/Registration:** On login/registration, the guest session cart is merged into the user's database cart (server-side merge).

**Why:** Ensures the cart survives across refreshes and different browsers (if the cookie is managed), and allows for a more consistent data model between guest and authenticated users.

## Images — Polymorphic Association

`Images` uses an `entity_type` + `entity_id` pattern instead of separate FK columns per entity. There is no database-level FK enforcement. Valid `entity_type` values and the constraint that `entity_id` must reference an existing record must be enforced at the application level.
