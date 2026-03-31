# Project Notes

## Orders — Address Freezing

When creating an order, always insert new rows into the `Addresses` table for both shipping and billing — never reuse existing address IDs from the user's profile.

**Why:** The address must be frozen at the point of order placement. If the user later changes their saved address, the order must still reflect the address used at purchase time.

## Images — Polymorphic Association

`Images` uses an `entity_type` + `entity_id` pattern instead of separate FK columns per entity. There is no database-level FK enforcement. Valid `entity_type` values and the constraint that `entity_id` must reference an existing record must be enforced at the application level.
