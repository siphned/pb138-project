import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});
