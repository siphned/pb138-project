/**
 * Wipes all tables and runs the demo seed.
 * Run with: bun run src/db/reset-and-seed-demo.ts
 */
import { sql } from "drizzle-orm";
import { db } from "./index";

await db.execute(sql`
  TRUNCATE TABLE
    order_items,
    orders,
    cart_items,
    carts,
    guest_sessions,
    event_comments,
    event_registrations,
    event_invitations,
    events,
    comments,
    reviews,
    product_wines,
    products,
    images,
    availability_exceptions,
    availability_regular,
    supply_agreements,
    wines,
    role_requests,
    shops,
    winemakers,
    addresses,
    user_roles,
    users
  RESTART IDENTITY CASCADE
`);

await import("./seed.demo");
