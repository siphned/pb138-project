import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { timestamptz } from "./helpers";

export const addresses = pgTable("addresses", {
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 50 }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  houseNumber: varchar("house_number", { length: 20 }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  updatedAt: timestamptz("updated_at"),
});

export const addressSelectSchema = createSelectSchema(addresses);
export const addressInsertSchema = createInsertSchema(addresses);
export type AddressModel = typeof addresses.$inferSelect;
