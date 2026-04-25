import { t } from 'elysia'

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const addressBody = t.Object({
  country: t.String({ minLength: 1, maxLength: 50 }),
  city: t.String({ minLength: 1, maxLength: 255 }),
  postalCode: t.String({ minLength: 1, maxLength: 20 }),
  street: t.String({ minLength: 1, maxLength: 255 }),
  houseNumber: t.String({ minLength: 1, maxLength: 20 }),
})

// ─── Request schemas ──────────────────────────────────────────────────────────

export const createEventBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ minLength: 1, maxLength: 10000 })),
  capacity: t.Integer({ minimum: 1, maximum: 32767 }),
  startTime: t.String({ format: 'date-time' }),
  endTime: t.String({ format: 'date-time' }),
  inviteType: t.Union([t.Literal('open'), t.Literal('invite_only')]),
  visibility: t.Union([t.Literal('public'), t.Literal('private')]),
  address: addressBody,
})

export const updateEventBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.Nullable(t.String({ minLength: 1, maxLength: 10000 }))),
  capacity: t.Optional(t.Integer({ minimum: 1, maximum: 32767 })),
  startTime: t.Optional(t.String({ format: 'date-time' })),
  endTime: t.Optional(t.String({ format: 'date-time' })),
})

export const listEventsQuery = t.Object({
  winemakerName: t.Optional(t.String({ maxLength: 255 })),
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
  body: t.String({ minLength: 1, maxLength: 2000 }),
})

export const eventParams = t.Object({ id: t.String() })

// ─── Response schemas ─────────────────────────────────────────────────────────

export const eventResponse = t.Object({
  id: t.String(),
  winemakerId: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  addressId: t.String(),
  capacity: t.Number(),
  startTime: t.Date(),
  endTime: t.Date(),
  status: t.Union([t.Literal('pending'), t.Literal('approved'), t.Literal('rejected')]),
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
  inviteType: t.String(),
  visibility: t.Union([t.Literal('public'), t.Literal('private')]),
  winemaker: t.Nullable(t.Object({ id: t.String(), name: t.String() })),
  address: t.Nullable(t.Object({
    country: t.String(),
    city: t.String(),
    postalCode: t.String(),
    street: t.String(),
    houseNumber: t.String(),
  })),
})

export const paginatedEventsResponse = t.Object({
  data: t.Array(eventResponse),
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
})

export const registrationResponse = t.Object({
  id: t.String(),
  eventId: t.String(),
  userId: t.String(),
  createdAt: t.Date(),
})

const commentWithUserResponse = t.Object({
  id: t.String(),
  eventId: t.String(),
  userId: t.String(),
  body: t.String(),
  createdAt: t.Date(),
  user: t.Object({ id: t.String(), fname: t.String(), lname: t.String() }),
})

export const commentResponse = t.Object({
  id: t.String(),
  eventId: t.String(),
  userId: t.String(),
  body: t.String(),
  createdAt: t.Date(),
})

export const paginatedCommentsResponse = t.Object({
  data: t.Array(commentWithUserResponse),
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
})
