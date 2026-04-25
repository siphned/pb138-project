import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamptz } from "./helpers";
import { shops, winemakers } from "./sellers";

export const availabilityRegular = pgTable("availability_regular", {
  id: uuid("id").primaryKey().defaultRandom(),
  winemakerId: uuid("winemaker_id").references(() => winemakers.id),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  dow: integer("dow").notNull(), // day of week 0-6
  startTime: timestamptz("start_time").notNull(),
  endTime: timestamptz("end_time").notNull(),
  validFrom: varchar("valid_from", { length: 10 }).notNull(), // YYYY-MM-DD
  validTo: varchar("valid_to", { length: 10 }),
  type: varchar("type", { length: 20 }).notNull(), // "open", "closed"
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
});

export const availabilityExceptions = pgTable("availability_exceptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  winemakerId: uuid("winemaker_id").references(() => winemakers.id),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  startsAt: timestamptz("starts_at").notNull(),
  endsAt: timestamptz("ends_at").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // "closed", "modified_hours"
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
});
