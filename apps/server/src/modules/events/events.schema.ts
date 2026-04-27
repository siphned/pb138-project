import { t } from "elysia";

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const addressBody = t.Object({
  city: t.String({ maxLength: 255, minLength: 1 }),
  country: t.String({ maxLength: 50, minLength: 1 }),
  houseNumber: t.String({ maxLength: 20, minLength: 1 }),
  postalCode: t.String({ maxLength: 20, minLength: 1 }),
  street: t.String({ maxLength: 255, minLength: 1 }),
});

// ─── Request schemas ──────────────────────────────────────────────────────────

export const createEventBody = t.Object({
  address: addressBody,
  capacity: t.Integer({ maximum: 32767, minimum: 1 }),
  description: t.Optional(t.String({ maxLength: 10000, minLength: 1 })),
  endTime: t.String({ format: "date-time" }),
  inviteType: t.Union([t.Literal("open"), t.Literal("invite_only")]),
  name: t.String({ maxLength: 255, minLength: 1 }),
  startTime: t.String({ format: "date-time" }),
  visibility: t.Union([t.Literal("public"), t.Literal("private")]),
});

export const updateEventBody = t.Object({
  capacity: t.Optional(t.Integer({ maximum: 32767, minimum: 1 })),
  description: t.Optional(t.Nullable(t.String({ maxLength: 10000, minLength: 1 }))),
  endTime: t.Optional(t.String({ format: "date-time" })),
  name: t.Optional(t.String({ maxLength: 255, minLength: 1 })),
  startTime: t.Optional(t.String({ format: "date-time" })),
});

export const listEventsQuery = t.Object({
  from: t.Optional(t.String({ format: "date-time" })),
  limit: t.Optional(t.Number({ maximum: 100, minimum: 1 })),
  page: t.Optional(t.Number({ minimum: 1 })),
  to: t.Optional(t.String({ format: "date-time" })),
  winemakerName: t.Optional(t.String({ maxLength: 255 })),
});

export const paginationQuery = t.Object({
  limit: t.Optional(t.Number({ maximum: 100, minimum: 1 })),
  page: t.Optional(t.Number({ minimum: 1 })),
});

export const createCommentBody = t.Object({
  body: t.String({ maxLength: 2000, minLength: 1 }),
});

export const eventParams = t.Object({ id: t.String() });

// ─── Response schemas ─────────────────────────────────────────────────────────

export const eventResponse = t.Object({
  address: t.Nullable(
    t.Object({
      city: t.String(),
      country: t.String(),
      houseNumber: t.String(),
      postalCode: t.String(),
      street: t.String(),
    })
  ),
  addressId: t.String(),
  capacity: t.Number(),
  createdAt: t.Date(),
  description: t.Nullable(t.String()),
  endTime: t.Date(),
  id: t.String(),
  inviteType: t.String(),
  name: t.String(),
  startTime: t.Date(),
  status: t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")]),
  updatedAt: t.Nullable(t.Date()),
  visibility: t.Union([t.Literal("public"), t.Literal("private")]),
  winemaker: t.Nullable(t.Object({ id: t.String(), name: t.String() })),
  winemakerId: t.String(),
});

export const paginatedEventsResponse = t.Object({
  data: t.Array(eventResponse),
  limit: t.Number(),
  page: t.Number(),
  total: t.Number(),
});

export const registrationResponse = t.Object({
  createdAt: t.Date(),
  eventId: t.String(),
  id: t.String(),
  userId: t.String(),
});

const commentWithUserResponse = t.Object({
  body: t.String(),
  createdAt: t.Date(),
  eventId: t.String(),
  id: t.String(),
  user: t.Object({ fname: t.String(), id: t.String(), lname: t.String() }),
  userId: t.String(),
});

export const commentResponse = t.Object({
  body: t.String(),
  createdAt: t.Date(),
  eventId: t.String(),
  id: t.String(),
  userId: t.String(),
});

export const paginatedCommentsResponse = t.Object({
  data: t.Array(commentWithUserResponse),
  limit: t.Number(),
  page: t.Number(),
  total: t.Number(),
});
