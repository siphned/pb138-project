import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses } from "./addresses";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const winemakers = pgTable("winemakers", {
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  description: text("description").notNull(),
  email: text("email"),
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  updatedAt: timestamptz("updated_at"),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  websiteUrl: text("website_url"),
});

export const shops = pgTable("shops", {
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  description: text("description").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id),
  updatedAt: timestamptz("updated_at"),
});

export const winemakerSelectSchema = createSelectSchema(winemakers);
export const winemakerInsertSchema = createInsertSchema(winemakers);
export type WinemakerModel = typeof winemakers.$inferSelect;

export const shopSelectSchema = createSelectSchema(shops);
export const shopInsertSchema = createInsertSchema(shops);
export type ShopModel = typeof shops.$inferSelect;
