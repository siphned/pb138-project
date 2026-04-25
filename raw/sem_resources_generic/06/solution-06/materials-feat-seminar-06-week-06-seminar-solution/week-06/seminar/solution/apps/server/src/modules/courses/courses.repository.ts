import { eq, count, gte, lte, and, getTableColumns } from 'drizzle-orm'
import type { Database } from '../../db'
import { courses as coursesTable, enrollments as enrollmentsTable } from '../../db/schema'
import type { Course, CourseFilter, CreateCourse } from './course.types'

const findAll = async (db: Database, filter?: CourseFilter): Promise<Course[]> => {
  const conditions = []
  if (filter?.semester) conditions.push(eq(coursesTable.semester, filter.semester))
  if (filter?.minCredits !== undefined) conditions.push(gte(coursesTable.credits, filter.minCredits))
  if (filter?.maxCredits !== undefined) conditions.push(lte(coursesTable.credits, filter.maxCredits))
  if (filter?.instructorId) conditions.push(eq(coursesTable.instructorId, filter.instructorId))

  const rows = await db
    .select({
      ...getTableColumns(coursesTable),
      enrolled: count(enrollmentsTable.id),
    })
    .from(coursesTable)
    .leftJoin(enrollmentsTable, eq(coursesTable.id, enrollmentsTable.courseId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(coursesTable.id)
  return rows
}

const findById = async (db: Database, id: string): Promise<Course | undefined> => {
  const rows = await db
    .select({
      ...getTableColumns(coursesTable),
      enrolled: count(enrollmentsTable.id),
    })
    .from(coursesTable)
    .leftJoin(enrollmentsTable, eq(coursesTable.id, enrollmentsTable.courseId))
    .where(eq(coursesTable.id, id))
    .groupBy(coursesTable.id)
  return rows[0]
}

const create = async (db: Database, data: CreateCourse): Promise<Course> => {
  const [created] = await db.insert(coursesTable).values(data).returning()
  return { ...created, enrolled: 0 }
}

export const coursesRepository = { findAll, findById, create }
