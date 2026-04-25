import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamptz } from "./helpers";

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  entityId: uuid("entity_id").notNull(),
  entityType: text("entity_type").notNull(), // "wine", "event", "review"
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});
