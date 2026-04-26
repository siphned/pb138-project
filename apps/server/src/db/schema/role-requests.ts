import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { roleRequestStatusEnum, roleRequestTypeEnum } from "./enums";
import { timestamptz } from "./helpers";
import { users } from "./users";

export const roleRequests = pgTable("role_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: roleRequestTypeEnum("type").notNull(),
  status: roleRequestStatusEnum("status").notNull().default("pending"),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  details: text("details"),
  adminUserId: uuid("admin_user_id").references(() => users.id),
  submittedAt: timestamptz("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamptz("reviewed_at"),
  deletedAt: timestamptz("deleted_at"),
});
