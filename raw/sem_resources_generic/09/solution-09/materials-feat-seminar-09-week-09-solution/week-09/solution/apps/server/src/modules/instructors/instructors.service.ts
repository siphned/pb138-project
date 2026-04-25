import { db } from '../../db'
import type { CreateInstructor } from './instructor.types'
import { instructorsRepository } from './instructors.repository'

const getAll = () =>
  instructorsRepository.findAll(db)

const getById = (id: string) =>
  instructorsRepository.findById(db, id)

const create = (body: CreateInstructor) =>
  instructorsRepository.create(db, body)

export const instructorsService = { getAll, getById, create }
