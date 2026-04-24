import { pgTable, smallint, uuid } from "drizzle-orm/pg-core";
import { products } from "./catalog";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: smallint("quantity").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});
