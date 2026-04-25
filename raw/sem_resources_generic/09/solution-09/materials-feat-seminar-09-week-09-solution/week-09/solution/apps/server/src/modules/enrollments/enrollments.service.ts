import { trace } from '@opentelemetry/api'
import { db } from '../../db'
import { coursesRepository } from '../courses/courses.repository'
import type { BulkEnroll, TransferEnrollment } from './enrollment.types'
import { enrollmentsRepository } from './enrollments.repository'

const tracer = trace.getTracer('pb138-server')

const bulkEnroll = async (data: BulkEnroll): Promise<number> => {
  return tracer.startActiveSpan('enrollment.bulkEnroll', async (span) => {
    try {
      const count = await db.transaction(async (tx) => {
        for (const courseId of data.courseIds) {
          await enrollmentsRepository.createEnrollment(tx, data.studentId, courseId)
        }
        return data.courseIds.length
      })

      span.setAttribute('app.student_id', data.studentId)
      span.setAttribute('app.course_ids', data.courseIds.join(','))
      span.setAttribute('app.enrolled_count', count)
      span.end()
      return count
    } catch (err) {
      span.recordException(err as Error)
      span.end()
      throw err
    }
  })
}

const transferEnrollment = async (data: TransferEnrollment): Promise<void> => {
  await db.transaction(async (tx) => {
    const course = await coursesRepository.findById(tx, data.toCourseId)
    if (!course) throw new Error('Target course not found')

    const enrolled = await enrollmentsRepository.countByCourse(tx, data.toCourseId)
    if (enrolled >= course.capacity) throw new Error('Target course is full')

    const deleted = await enrollmentsRepository.deleteEnrollment(tx, data.studentId, data.fromCourseId)
    if (deleted === 0) throw new Error('Student is not enrolled in the source course')

    await enrollmentsRepository.createEnrollment(tx, data.studentId, data.toCourseId)
  }, { isolationLevel: 'serializable' })
}

export const enrollmentsService = { bulkEnroll, transferEnrollment }
