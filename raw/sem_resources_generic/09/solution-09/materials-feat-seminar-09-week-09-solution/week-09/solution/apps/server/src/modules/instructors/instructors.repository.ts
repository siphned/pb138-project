import { eq } from 'drizzle-orm'
import type { Database } from '../../db'
import { instructors as instructorsTable } from '../../db/schema'
import type { CreateInstructor, Instructor } from './instructor.types'

const findAll = async (db: Database): Promise<Instructor[]> => {
  return await db.select().from(instructorsTable)
}

const findById = async (db: Database, id: string): Promise<Instructor | undefined> => {
  const rows = await db.select().from(instructorsTable).where(eq(instructorsTable.id, id))
  return rows[0]
}

const create = async (db: Database, data: CreateInstructor): Promise<Instructor> => {
  const [created] = await db.insert(instructorsTable).values(data).returning()
  return created
}

export const instructorsRepository = { findAll, findById, create }
