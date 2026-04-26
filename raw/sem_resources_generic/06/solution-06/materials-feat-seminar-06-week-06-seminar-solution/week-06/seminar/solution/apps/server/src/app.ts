import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'
import { z } from 'zod'
import { DatabaseError } from 'pg'

import type { ProblemDetail } from './types'
import { studentsRouter } from './modules/students/students.routes'
import { coursesRouter } from './modules/courses/courses.routes'
import { instructorsRouter } from './modules/instructors/instructors.routes'
import { enrollmentsRouter } from './modules/enrollments/enrollments.routes'

const PG_ERROR = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const

function getDatabaseError(error: unknown): DatabaseError | undefined {
  if (error instanceof DatabaseError) return error
  if (error instanceof Error && error.cause instanceof DatabaseError) return error.cause
  return undefined
}

function mapDatabaseError(dbError: DatabaseError): ProblemDetail {
  switch (dbError.code) {
    case PG_ERROR.UNIQUE_VIOLATION:
      return { status: 409, title: 'Conflict', detail: dbError.detail ?? 'Unique constraint violated' }

    case PG_ERROR.FOREIGN_KEY_VIOLATION:
      return { status: 400, title: 'Bad Request', detail: dbError.detail ?? 'Referenced entity does not exist' }

    case PG_ERROR.NOT_NULL_VIOLATION:
      return { status: 400, title: 'Bad Request', detail: dbError.detail ?? 'A required field is missing' }

    case PG_ERROR.CHECK_VIOLATION:
      return { status: 400, title: 'Bad Request', detail: dbError.detail ?? 'Check constraint violated' }

    default:
      return { status: 500, title: 'Internal Server Error', detail: 'Database operation failed' }
  }
}

export function createApp() {
  return new Elysia()
    .use(
      cors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
      }),
    )
    .use(
      openapi({
        path: '/api-docs',
        mapJsonSchema: {
          zod: (schema: z.ZodTypeAny) =>
            z.toJSONSchema(schema, { target: 'openapi-3.0' }),
        },
        exclude: { methods: ['OPTIONS'] },
        documentation: {
          info: {
            title: 'PB138 REST API',
            version: '1.0.0',
          },
        },
        scalar: {
          spec: {
            url: '/api-docs/json',
          },
        },
      }),
    )
    .onBeforeHandle(async () => {
      if (process.env.SLOW_MODE === 'true') {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    })
    .onError(({ error, code, set }) => {
      const dbError = getDatabaseError(error)

      if (dbError) {
        const problem = mapDatabaseError(dbError)
        set.status = problem.status
        return problem
      }

      if (code === 'VALIDATION') {
        set.status = 400
        return { status: 400, title: 'Validation Error', detail: error.message } satisfies ProblemDetail
      }

      console.error('Unhandled error:', error)

      set.status = 500
      return { status: 500, title: 'Internal Server Error' } satisfies ProblemDetail
    })
    .use(studentsRouter)
    .use(coursesRouter)
    .use(instructorsRouter)
    .use(enrollmentsRouter)
}
