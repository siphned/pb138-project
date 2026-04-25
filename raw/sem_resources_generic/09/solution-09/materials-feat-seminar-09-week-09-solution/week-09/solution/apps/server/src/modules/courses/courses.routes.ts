import { Elysia } from 'elysia'
import { z } from 'zod'
import { CourseQuerySchema, CourseSchema, CreateCourseBodySchema } from './course.schema'
import { ProblemDetailSchema } from '../../types'
import { coursesService } from './courses.service'
import { requirePermission } from '../../middleware/requirePermission'

export const coursesRouter = new Elysia({ prefix: '/courses', tags: ['Courses'] })
  .model({
    Course: CourseSchema,
    CourseList: z.array(CourseSchema),
    CreateCourseBody: CreateCourseBodySchema,
    ProblemDetail: ProblemDetailSchema,
  })

  // GET /courses
  .get('/', async ({ query }) => {
    return coursesService.getAll({
      semester: query.semester,
      minCredits: query.minCredits,
      maxCredits: query.maxCredits,
      instructorId: query.instructorId,
    })
  }, {
    query: CourseQuerySchema,
    response: { 200: 'CourseList' },
    detail: {
      description: 'Returns all courses. Supports optional filtering via query parameters.',
    },
  })

  // GET /courses/:id
  .get('/:id', async ({ params: { id }, set }) => {
    const course = await coursesService.getById(id)
    if (!course) {
      set.status = 404
      return { status: 404, title: 'Not Found', detail: `Course with id '${id}' not found` }
    }
    return course
  }, {
    response: { 200: 'Course', 404: 'ProblemDetail' },
    detail: {
      description: 'Returns a single course by its ID.',
    },
  })

  // POST /courses
  .use(requirePermission('org:courses:create'))
  .post('/', async ({ body }) => {
    return coursesService.create(body)
  }, {
    body: 'CreateCourseBody',
    response: { 200: 'Course' },
    detail: {
      description: 'Creates a new course. The request body is validated by Zod.',
    },
  })
