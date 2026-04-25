import { pgTable, uuid, text, integer, timestamp, unique, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Students ────────────────────────────────────────────────────────────────

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  uco: text('uco').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Instructors ─────────────────────────────────────────────────────────────

export const instructors = pgTable('instructors', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  department: text('department').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Courses ─────────────────────────────────────────────────────────────────

export const semesterEnum = pgEnum('semester', ['fall', 'spring'])

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  credits: integer('credits').notNull(),
  instructorId: uuid('instructor_id').notNull().references(() => instructors.id),
  semester: semesterEnum('semester').notNull(),
  year: integer('year').notNull(),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Enrollments (M:N junction table) ────────────────────────────────────────

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.studentId, t.courseId),
])

// ── Relations ───────────────────────────────────────────────────────────────

export const studentRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
}))

export const instructorRelations = relations(instructors, ({ many }) => ({
  courses: many(courses),
}))

export const courseRelations = relations(courses, ({ one, many }) => ({
  instructor: one(instructors, { fields: [courses.instructorId], references: [instructors.id] }),
  enrollments: many(enrollments),
}))

export const enrollmentRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}))
