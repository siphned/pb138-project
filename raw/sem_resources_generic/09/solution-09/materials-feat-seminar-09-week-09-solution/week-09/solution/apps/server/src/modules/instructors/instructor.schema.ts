import { z } from 'zod'

export const InstructorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  department: z.string(),
})

export const CreateInstructorBodySchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.email(),
  department: z.string().min(1),
})
