import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { timestamptz } from "./helpers";

export const images = pgTable("images", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  entityId: uuid("entity_id").notNull(),
  entityType: text("entity_type").notNull(), // "wine", "event", "review"
  id: uuid("id").primaryKey().defaultRandom(),
  updatedAt: timestamptz("updated_at"),
  url: text("url").notNull(),
});

export const imageSelectSchema = createSelectSchema(images);
export const imageInsertSchema = createInsertSchema(images);
export type ImageModel = typeof images.$inferSelect;
