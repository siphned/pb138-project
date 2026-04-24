import { pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./catalog";
import { winemakers } from "./sellers";
import { users } from "./users";

export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  rating: smallint("rating").notNull(),
  body: text("body"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

export const winemakerReviews = pgTable("winemaker_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
  rating: smallint("rating").notNull(),
  body: text("body"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
