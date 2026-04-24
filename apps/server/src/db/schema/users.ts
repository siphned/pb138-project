import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";
import { addresses } from "./addresses";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  fname: varchar("fname", { length: 30 }).notNull(),
  lname: varchar("lname", { length: 30 }).notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("user"),
  shippingAddressId: uuid("shipping_address_id").references(() => addresses.id),
  billingAddressId: uuid("billing_address_id").references(() => addresses.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
