import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { addresses } from "./addresses";
import { userStatusEnum } from "./enums";
import { timestamptz } from "./helpers";

export const users = pgTable("users", {
  billingAddressId: uuid("billing_address_id").references(() => addresses.id),
  clerkId: text("clerk_id").notNull().unique(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  email: text("email").notNull().unique(),
  fname: varchar("fname", { length: 30 }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  lname: varchar("lname", { length: 30 }).notNull(),
  shippingAddressId: uuid("shipping_address_id").references(() => addresses.id),
  status: userStatusEnum("status").notNull().default("active"),
  updatedAt: timestamptz("updated_at"),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const userRoles = pgTable("user_roles", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  id: uuid("id").primaryKey().defaultRandom(),
  role: varchar("role", { length: 50 }).notNull(),
  updatedAt: timestamptz("updated_at"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const selectUserRoleSchema = createSelectSchema(userRoles);

export type UserModel = typeof users.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;

/**
 * Request schema for profile update.
 * Subset of user fields that customers can edit.
 * Different from insertUserSchema (which includes clerk fields).
 */
export const profileUpdateSchema = z.object({
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  location: z.string().min(1, "Address is required"),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL").or(z.literal("")),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
