import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
<<<<<<< HEAD
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
=======
>>>>>>> origin/main
import { timestamptz } from "./helpers";
import { shops, winemakers } from "./sellers";

export const availabilityRegular = pgTable("availability_regular", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  dow: integer("dow").notNull(),
  endTime: timestamptz("end_time").notNull(), // day of week 0-6
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  startTime: timestamptz("start_time").notNull(), // YYYY-MM-DD
  type: varchar("type", { length: 20 }).notNull(),
  validFrom: varchar("valid_from", { length: 10 }).notNull(), // "open", "closed"
  validTo: varchar("valid_to", { length: 10 }),
  winemakerId: uuid("winemaker_id").references(() => winemakers.id),
});

export const availabilityExceptions = pgTable("availability_exceptions", {
  action: varchar("action", { length: 20 }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  endsAt: timestamptz("ends_at").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  reason: varchar("reason", { length: 255 }), // "closed", "modified_hours"
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  startsAt: timestamptz("starts_at").notNull(),
  updatedAt: timestamptz("updated_at"),
  winemakerId: uuid("winemaker_id").references(() => winemakers.id),
});
<<<<<<< HEAD

export const availabilityRegularSelectSchema = createSelectSchema(availabilityRegular);
export const availabilityRegularInsertSchema = createInsertSchema(availabilityRegular);
export type AvailabilityRegularModel = typeof availabilityRegular.$inferSelect;

export const availabilityExceptionSelectSchema = createSelectSchema(availabilityExceptions);
export const availabilityExceptionInsertSchema = createInsertSchema(availabilityExceptions);
export type AvailabilityExceptionModel = typeof availabilityExceptions.$inferSelect;
=======
>>>>>>> origin/main
