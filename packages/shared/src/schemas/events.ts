import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses } from "./addresses";
import { eventStatusEnum, eventVisibilityEnum } from "./enums";
import { timestamptz } from "./helpers";
import { winemakers } from "./sellers";
import { users } from "./users";

export const events = pgTable("events", {
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  capacity: smallint("capacity").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  description: text("description"),
  endTime: timestamptz("end_time").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  inviteType: varchar("invite_type", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  startTime: timestamptz("start_time").notNull(),
  status: eventStatusEnum("status").notNull().default("pending"),
  updatedAt: timestamptz("updated_at"),
  visibility: eventVisibilityEnum("visibility").notNull(),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
});

export const eventInvitations = pgTable("event_invitations", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  email: text("email").notNull(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  expiresAt: timestamptz("expires_at").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  updatedAt: timestamptz("updated_at"),
});

export const eventRegistrations = pgTable("event_registrations", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});

export const eventComments = pgTable("event_comments", {
  body: text("body").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});

export const eventSelectSchema = createSelectSchema(events);
export const eventInsertSchema = createInsertSchema(events);
export type EventModel = typeof events.$inferSelect;

export const eventInvitationSelectSchema = createSelectSchema(eventInvitations);
export const eventInvitationInsertSchema = createInsertSchema(eventInvitations);
export type EventInvitationModel = typeof eventInvitations.$inferSelect;

export const eventRegistrationSelectSchema = createSelectSchema(eventRegistrations);
export const eventRegistrationInsertSchema = createInsertSchema(eventRegistrations);
export type EventRegistrationModel = typeof eventRegistrations.$inferSelect;

export const eventCommentSelectSchema = createSelectSchema(eventComments);
export const eventCommentInsertSchema = createInsertSchema(eventComments);
export type EventCommentModel = typeof eventComments.$inferSelect;
