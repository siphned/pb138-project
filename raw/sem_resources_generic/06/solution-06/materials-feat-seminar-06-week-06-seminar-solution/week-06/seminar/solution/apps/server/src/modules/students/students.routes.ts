import { Elysia } from 'elysia'
import { z } from 'zod'
import { CreateStudentBodySchema, StudentFilterSchema, StudentSchema } from './student.schema'
import { ProblemDetailSchema } from '../../types'
import { studentsService } from './students.service'

export const studentsRouter = new Elysia({ prefix: '/students', tags: ['Students'] })
  .model({
    Student: StudentSchema,
    StudentList: z.array(StudentSchema),
    CreateStudentBody: CreateStudentBodySchema,
    ProblemDetail: ProblemDetailSchema,
  })

  // GET /students
  .get('/', async ({ query }) => {
    return studentsService.getAll(query)
  }, {
    query: StudentFilterSchema,
    response: { 200: 'StudentList' },
    detail: {
      description: 'Returns all students. Optionally filter by enrolled course.',
    },
  })

  // GET /students/:id
  .get('/:id', async ({ params: { id }, set }) => {
    const student = await studentsService.getById(id)
    if (!student) {
      set.status = 404
      return { status: 404, title: 'Not Found', detail: `Student with id '${id}' not found` }
    }
    return student
  }, {
    response: { 200: 'Student', 404: 'ProblemDetail' },
    detail: {
      description: 'Returns a single student by ID.',
    },
  })

  // POST /students
  .post('/', async ({ body }) => {
    return studentsService.create(body)
  }, {
    body: 'CreateStudentBody',
    response: { 200: 'Student' },
    detail: {
      description: 'Creates a new student. Validates email format and UCO (must be exactly 6 digits).',
    },
  })
