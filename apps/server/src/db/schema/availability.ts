import { date, pgTable, smallint, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { shops, winemakers } from './sellers'

export const availabilityRegular = pgTable('availability_regular', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').references(() => winemakers.id),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  dow: smallint('dow').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  validFrom: date('valid_from').notNull(),
  validTo: date('valid_to'),
  type: varchar('type', { length: 255 }).notNull(),
})

export const availabilityExceptions = pgTable('availability_exceptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').references(() => winemakers.id),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  reason: text('reason'),
})
