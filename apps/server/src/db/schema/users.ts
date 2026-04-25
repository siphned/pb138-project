import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { userRoleEnum, userStatusEnum } from "./enums";
import { timestamptz } from "./helpers";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  fname: varchar("fname", { length: 30 }).notNull(),
  lname: varchar("lname", { length: 30 }).notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("active"),
  shippingAddressId: uuid("shipping_address_id").references(() => addresses.id),
  billingAddressId: uuid("billing_address_id").references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
});
