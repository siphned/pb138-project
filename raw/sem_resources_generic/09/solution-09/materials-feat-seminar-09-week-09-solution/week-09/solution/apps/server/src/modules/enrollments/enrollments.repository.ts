import { eq, and, count } from 'drizzle-orm'
import type { Database } from '../../db'
import { enrollments as enrollmentsTable } from '../../db/schema'

/** Insert a single enrollment. */
const createEnrollment = async (db: Database, studentId: string, courseId: string) => {
  const [row] = await db.insert(enrollmentsTable).values({ studentId, courseId }).returning()
  return row
}

/** Delete a student's enrollment in a specific course. Returns the number of deleted rows. */
const deleteEnrollment = async (db: Database, studentId: string, courseId: string): Promise<number> => {
  const result = await db
    .delete(enrollmentsTable)
    .where(and(eq(enrollmentsTable.studentId, studentId), eq(enrollmentsTable.courseId, courseId)))
    .returning()
  return result.length
}

/** Count how many students are enrolled in a given course. */
const countByCourse = async (db: Database, courseId: string): Promise<number> => {
  const [result] = await db
    .select({ count: count() })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.courseId, courseId))
  return result.count
}

export const enrollmentsRepository = { createEnrollment, deleteEnrollment, countByCourse }
