import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: varchar('country', { length: 50 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  houseNumber: varchar('house_number', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})
