import { Elysia } from 'elysia'
import { z } from 'zod'
import { enrollmentsService } from './enrollments.service'

const BulkEnrollBodySchema = z.object({
  courseIds: z.array(z.uuid()).min(1),
})

const TransferBodySchema = z.object({
  fromCourseId: z.uuid(),
  toCourseId: z.uuid(),
})

export const enrollmentsRouter = new Elysia({ prefix: '/students', tags: ['Enrollments'] })

  // POST /students/:id/enroll — bulk enrollment using a transaction
  .post('/:id/enroll', async ({ params: { id: studentId }, body }) => {
    const enrolled = await enrollmentsService.bulkEnroll({
      studentId,
      courseIds: body.courseIds,
    })
    return { enrolled }
  }, {
    body: BulkEnrollBodySchema,
    response: { 200: z.object({ enrolled: z.number() }) },
    detail: {
      description: 'Enroll a student into multiple courses at once. Uses a transaction — all or nothing.',
    },
  })

  // POST /students/:id/transfer — transfer between courses (serializable transaction)
  .post('/:id/transfer', async ({ params: { id: studentId }, body, set }) => {
    try {
      await enrollmentsService.transferEnrollment({
        studentId,
        fromCourseId: body.fromCourseId,
        toCourseId: body.toCourseId,
      })
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transfer failed'
      if (message === 'Target course is full' || message === 'Student is not enrolled in the source course' || message === 'Target course not found') {
        set.status = 409
        return { error: message }
      }
      throw error
    }
  }, {
    body: TransferBodySchema,
    response: {
      200: z.object({ success: z.boolean() }),
      409: z.object({ error: z.string() }),
    },
    detail: {
      description: 'Transfer a student from one course to another. Uses a serializable transaction to enforce capacity limits.',
    },
  })
