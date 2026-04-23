import { t } from 'elysia'

const addressBody = t.Object({
  country: t.String({ minLength: 1, maxLength: 50 }),
  city: t.String({ minLength: 1, maxLength: 255 }),
  postalCode: t.String({ minLength: 1, maxLength: 20 }),
  street: t.String({ minLength: 1, maxLength: 255 }),
  houseNumber: t.String({ minLength: 1, maxLength: 20 }),
})

export const createEventBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ minLength: 1 })),
  capacity: t.Integer({ minimum: 1 }),
  startTime: t.String({ format: 'date-time' }),
  endTime: t.String({ format: 'date-time' }),
  inviteType: t.String({ minLength: 1, maxLength: 255 }),
  visibility: t.Union([t.Literal('public'), t.Literal('private')]),
  address: addressBody,
})

export const updateEventBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  capacity: t.Optional(t.Integer({ minimum: 1 })),
  startTime: t.Optional(t.String({ format: 'date-time' })),
  endTime: t.Optional(t.String({ format: 'date-time' })),
})

export const listEventsQuery = t.Object({
  winemakerName: t.Optional(t.String()),
  from: t.Optional(t.String({ format: 'date-time' })),
  to: t.Optional(t.String({ format: 'date-time' })),
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
})

export const paginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
})

export const createCommentBody = t.Object({
  body: t.String({ minLength: 1 }),
})

export const eventParams = t.Object({ id: t.String() })
