import { pgTable, smallint, text, uuid } from "drizzle-orm/pg-core";
import { products } from "./catalog";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  rating: smallint("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id),
  text: text("text").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});
