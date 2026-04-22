import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { roleRequestStatusEnum, roleRequestTypeEnum } from './enums'
import { users } from './users'

export const roleRequests = pgTable('role_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  requestedRole: roleRequestTypeEnum('requested_role').notNull(),
  status: roleRequestStatusEnum('status').notNull().default('pending'),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  details: text('details'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedByAdminId: uuid('reviewed_by_admin_id').references(() => users.id),
})
