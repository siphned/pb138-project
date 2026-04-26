import { Elysia } from 'elysia'
import { z } from 'zod'
import { CreateInstructorBodySchema, InstructorSchema } from './instructor.schema'
import { ProblemDetailSchema } from '../../types'
import { instructorsService } from './instructors.service'

export const instructorsRouter = new Elysia({ prefix: '/instructors', tags: ['Instructors'] })
  .model({
    Instructor: InstructorSchema,
    InstructorList: z.array(InstructorSchema),
    CreateInstructorBody: CreateInstructorBodySchema,
    ProblemDetail: ProblemDetailSchema,
  })

  // GET /instructors
  .get('/', async () => {
    return instructorsService.getAll()
  }, {
    response: { 200: 'InstructorList' },
    detail: {
      description: 'Returns all instructors.',
    },
  })

  // GET /instructors/:id
  .get('/:id', async ({ params: { id }, set }) => {
    const instructor = await instructorsService.getById(id)
    if (!instructor) {
      set.status = 404
      return { status: 404, title: 'Not Found', detail: `Instructor with id '${id}' not found` }
    }
    return instructor
  }, {
    response: { 200: 'Instructor', 404: 'ProblemDetail' },
    detail: {
      description: 'Returns a single instructor by ID.',
    },
  })

  // POST /instructors
  .post('/', async ({ body }) => {
    return instructorsService.create(body)
  }, {
    body: 'CreateInstructorBody',
    response: { 200: 'Instructor' },
    detail: {
      description: 'Creates a new instructor.',
    },
  })
