import { db } from '../../db'
import type { CourseFilter, CreateCourse } from './course.types'
import { coursesRepository } from './courses.repository'

const getAll = (filter?: CourseFilter) =>
  coursesRepository.findAll(db, filter)

const getById = (id: string) =>
  coursesRepository.findById(db, id)

const create = (body: CreateCourse) =>
  coursesRepository.create(db, body)

export const coursesService = { getAll, getById, create }
