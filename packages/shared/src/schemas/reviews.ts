import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const reviews = pgTable("reviews", {
  body: text("body"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  entityId: uuid("entity_id").notNull(), // "product", "winemaker"
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  rating: smallint("rating").notNull(),
  updatedAt: timestamptz("updated_at"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});

export const comments = pgTable("comments", {
  body: text("body").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id),
  updatedAt: timestamptz("updated_at"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});

export const reviewSelectSchema = createSelectSchema(reviews);
export const reviewInsertSchema = createInsertSchema(reviews);
export type ReviewModel = typeof reviews.$inferSelect;

export const commentSelectSchema = createSelectSchema(comments);
export const commentInsertSchema = createInsertSchema(comments);
export type CommentModel = typeof comments.$inferSelect;
