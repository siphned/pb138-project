import { eq } from 'drizzle-orm'
import type { Database } from '../../db'
import { students as studentsTable } from '../../db/schema'
import type { CreateStudent, Student } from './student.types'

const findAll = async (db: Database): Promise<Student[]> => {
  return await db.select().from(studentsTable)
}

const findById = async (db: Database, id: string): Promise<Student | undefined> => {
  const rows = await db.select().from(studentsTable).where(eq(studentsTable.id, id))
  return rows[0]
}

const create = async (db: Database, data: CreateStudent): Promise<Student> => {
  const [created] = await db.insert(studentsTable).values(data).returning()
  return created
}

export const studentsRepository = { findAll, findById, create }
