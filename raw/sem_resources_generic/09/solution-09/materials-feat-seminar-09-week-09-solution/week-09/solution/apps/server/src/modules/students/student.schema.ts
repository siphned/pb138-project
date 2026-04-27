import { z } from 'zod'

export const StudentSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  uco: z.string(),
})

export const CreateStudentBodySchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.email(),
  uco: z.string().regex(/^\d{6}$/, 'UCO must be exactly 6 digits'),
})

export const StudentFilterSchema = z.object({
  courseId: z.string().optional(),
})
