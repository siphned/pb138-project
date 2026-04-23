import { pgTable, smallint, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { eventInviteStatusEnum, eventStatusEnum, eventVisibilityEnum } from './enums'
import { timestamptz } from './helpers'
import { addresses } from './addresses'
import { users } from './users'
import { winemakers } from './sellers'

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').notNull().references(() => winemakers.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  addressId: uuid('address_id').notNull().references(() => addresses.id),
  capacity: smallint('capacity').notNull(),
  startTime: timestamptz('start_time').notNull(),
  endTime: timestamptz('end_time').notNull(),
  status: eventStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
  inviteType: varchar('invite_type', { length: 255 }).notNull(),
  visibility: eventVisibilityEnum('visibility').notNull(),
})

export const eventInvites = pgTable('event_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  winemakerIdInvited: uuid('winemaker_id_invited').notNull().references(() => winemakers.id),
  token: uuid('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  status: eventInviteStatusEnum('status').notNull(),
})

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (t) => [
  uniqueIndex('uq_event_reg_event_user_active')
    .on(t.eventId, t.userId)
    .where(sql`${t.deletedAt} IS NULL`),
])
