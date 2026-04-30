import { t } from "elysia";

export const addRegularBody = t.Object({
  dow: t.Integer({ maximum: 6, minimum: 0 }),
  endTime: t.String({ pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }),
  startTime: t.String({ pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }),
  type: t.Union([t.Literal("open"), t.Literal("closed")]),
  validFrom: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  validTo: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
});

export const addExceptionBody = t.Object({
  action: t.Union([t.Literal("closed"), t.Literal("modified_hours"), t.Literal("special_event")]),
  endsAt: t.String({ format: "date-time" }),
  reason: t.Optional(t.String()),
  startsAt: t.String({ format: "date-time" }),
});

// Response schemas
export const regularResponse = t.Object({
  dow: t.Integer(),
  endTime: t.Date(),
  id: t.String(),
  shopId: t.String(),
  startTime: t.Date(),
  type: t.String(),
  validFrom: t.String(),
  validTo: t.Union([t.String(), t.Null()]),
  winemakerId: t.Union([t.String(), t.Null()]),
});

export const exceptionResponse = t.Object({
  action: t.String(),
  endsAt: t.Date(),
  id: t.String(),
  reason: t.Union([t.String(), t.Null()]),
  shopId: t.String(),
  startsAt: t.Date(),
  winemakerId: t.Union([t.String(), t.Null()]),
});

export const getAvailabilityResponse = t.Object({
  exceptions: t.Array(exceptionResponse),
  regular: t.Array(regularResponse),
});
