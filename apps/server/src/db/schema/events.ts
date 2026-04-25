import { sql } from "drizzle-orm";
import { pgTable, smallint, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { eventInviteStatusEnum, eventStatusEnum, eventVisibilityEnum } from "./enums";
import { timestamptz } from "./helpers";
import { winemakers } from "./sellers";
import { users } from "./users";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  capacity: smallint("capacity").notNull(),
  startTime: timestamptz("start_time").notNull(),
  endTime: timestamptz("end_time").notNull(),
  status: eventStatusEnum("status").notNull().default("pending"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
  inviteType: varchar("invite_type", { length: 255 }).notNull(),
  visibility: eventVisibilityEnum("visibility").notNull(),
});

export const eventInvitations = pgTable("event_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  expiresAt: timestamptz("expires_at").notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
});

// Extend eventRegistrations with unique constraint for active registrations
// This is handled through relations.ts since we already defined eventRegistrations above
