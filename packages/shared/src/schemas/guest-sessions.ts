import { pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { timestamptz } from "./helpers";

export const guestSessions = pgTable("guest_sessions", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  expiresAt: timestamptz("expires_at").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  updatedAt: timestamptz("updated_at"),
});

export const guestSessionSelectSchema = createSelectSchema(guestSessions);
export const guestSessionInsertSchema = createInsertSchema(guestSessions);
export type GuestSessionModel = typeof guestSessions.$inferSelect;
