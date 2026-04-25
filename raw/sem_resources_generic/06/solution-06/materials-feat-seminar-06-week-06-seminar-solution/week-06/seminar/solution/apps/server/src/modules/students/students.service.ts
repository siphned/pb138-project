import { db } from '../../db'
import type { CreateStudent, StudentFilter } from './student.types'
import { studentsRepository } from './students.repository'

const getAll = async (filter?: StudentFilter) => {
  const all = await studentsRepository.findAll(db)

  if (!filter?.courseId) return all

  // TODO (Task 4): Once enrollments are implemented, filter by courseId
  return all
}

const getById = (id: string) =>
  studentsRepository.findById(db, id)

const create = (body: CreateStudent) =>
  studentsRepository.create(db, body)

export const studentsService = { getAll, getById, create }
