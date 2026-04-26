import { pgTable, uuid } from "drizzle-orm/pg-core";
import { timestamptz } from "./helpers";

export const guestSessions = pgTable("guest_sessions", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  expiresAt: timestamptz("expires_at").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
});
