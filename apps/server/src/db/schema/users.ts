import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { userStatusEnum } from "./enums";
import { timestamptz } from "./helpers";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  fname: varchar("fname", { length: 30 }).notNull(),
  lname: varchar("lname", { length: 30 }).notNull(),
  email: text("email").notNull().unique(),
  status: userStatusEnum("status").notNull().default("active"),
  shippingAddressId: uuid("shipping_address_id").references(() => addresses.id),
  billingAddressId: uuid("billing_address_id").references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export type UserRole = typeof userRoles.$inferSelect;
