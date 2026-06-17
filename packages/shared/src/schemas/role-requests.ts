import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { roleRequestStatusEnum, roleRequestTypeEnum } from "./enums";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const roleRequests = pgTable("role_requests", {
  adminUserId: uuid("admin_user_id").references(() => users.id),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  deletedAt: timestamptz("deleted_at"),
  details: text("details"),
  id: uuid("id").primaryKey().defaultRandom(),
  reviewedAt: timestamptz("reviewed_at"),
  status: roleRequestStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamptz("submitted_at").notNull().defaultNow(),
  type: roleRequestTypeEnum("type").notNull(),
  updatedAt: timestamptz("updated_at"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});

export const roleRequestSelectSchema = createSelectSchema(roleRequests);
export const roleRequestInsertSchema = createInsertSchema(roleRequests);
export type RoleRequestModel = typeof roleRequests.$inferSelect;
