export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  uco: string
}

export interface CreateStudent {
  firstName: string
  lastName: string
  email: string
  uco: string
}

export interface StudentFilter {
  courseId?: string
}
