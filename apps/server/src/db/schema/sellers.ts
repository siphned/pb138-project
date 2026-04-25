import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { users } from "./users";

export const winemakers = pgTable("winemakers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  websiteUrl: text("websiteurl"),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
