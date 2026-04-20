import { t } from 'elysia'

export const userResponseSchema = t.Object({
  id: t.String(),
  clerkId: t.String(),
  fname: t.String(),
  lname: t.String(),
  email: t.String(),
  role: t.Union([t.Literal('user'), t.Literal('admin')]),
  createdAt: t.Date(),
})
