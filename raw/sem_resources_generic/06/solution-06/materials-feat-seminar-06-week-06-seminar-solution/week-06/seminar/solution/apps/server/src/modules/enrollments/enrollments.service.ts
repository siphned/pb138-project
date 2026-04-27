import { db } from '../../db'
import { coursesRepository } from '../courses/courses.repository'
import type { BulkEnroll, TransferEnrollment } from './enrollment.types'
import { enrollmentsRepository } from './enrollments.repository'

const bulkEnroll = async (data: BulkEnroll): Promise<number> => {
  return await db.transaction(async (tx) => {
    for (const courseId of data.courseIds) {
      await enrollmentsRepository.createEnrollment(tx, data.studentId, courseId)
    }
    return data.courseIds.length
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
