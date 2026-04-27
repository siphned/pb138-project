import { pgTable, smallint, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { products } from "./catalog";
import { guestSessions } from "./guest-sessions";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const carts = pgTable("carts", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .unique()
    .references(() => guestSessions.id),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id),
});

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    deletedAt: timestamptz("deleted_at"),
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: smallint("quantity").notNull(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    unq: uniqueIndex("cart_items_cart_id_product_id_key").on(t.cartId, t.productId),
  })
);
