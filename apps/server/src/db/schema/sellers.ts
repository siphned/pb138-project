import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const winemakers = pgTable("winemakers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url"),
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});

export const shops = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});
