import { z } from 'zod'

export const CourseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  credits: z.number().int(),
  instructorId: z.string(),
  semester: z.enum(['fall', 'spring']),
  year: z.number().int(),
  capacity: z.number().int(),
  enrolled: z.number().int(),
})

export const CreateCourseBodySchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  credits: z.number().int().min(1).max(10),
  instructorId: z.string().min(1),
  semester: z.enum(['fall', 'spring']),
  year: z.number().int().min(2000).max(2100),
  capacity: z.number().int().min(1).max(500),
})

export const CourseQuerySchema = z.object({
  semester: z.enum(['fall', 'spring']).optional(),
  minCredits: z.coerce.number().int().optional(),
  maxCredits: z.coerce.number().int().optional(),
  instructorId: z.string().optional(),
})
