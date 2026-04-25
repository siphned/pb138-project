import { z } from 'zod'

// RFC 9457 — Problem Details for HTTP APIs
export const ProblemDetailSchema = z.object({
  status: z.number().int(),
  title: z.string(),
  detail: z.string().optional(),
})

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>
