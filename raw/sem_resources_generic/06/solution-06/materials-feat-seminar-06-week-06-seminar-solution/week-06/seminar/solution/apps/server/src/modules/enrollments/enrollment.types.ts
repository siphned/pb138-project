export interface BulkEnroll {
  studentId: string
  courseIds: string[]
}

export interface TransferEnrollment {
  studentId: string
  fromCourseId: string
  toCourseId: string
}
