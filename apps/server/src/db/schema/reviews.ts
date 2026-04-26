import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  entityId: uuid("entity_id").notNull(),
  entityType: varchar("entity_type", { length: 20 }).notNull(), // "product", "winemaker"
  rating: smallint("rating").notNull(),
  body: text("body"),
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
  body: text("body").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});
