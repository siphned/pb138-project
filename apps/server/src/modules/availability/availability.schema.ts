import { t } from "elysia";

export const addRegularBody = t.Object({
  dow: t.Integer({ minimum: 0, maximum: 6 }),
  startTime: t.String({ pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }),
  endTime: t.String({ pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }),
  validFrom: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  validTo: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  type: t.Union([t.Literal("open"), t.Literal("closed")]),
});

export const addExceptionBody = t.Object({
  startsAt: t.String({ format: "date-time" }),
  endsAt: t.String({ format: "date-time" }),
  action: t.Union([t.Literal("closed"), t.Literal("modified_hours"), t.Literal("special_event")]),
  reason: t.Optional(t.String()),
});

// Response schemas
export const regularResponse = t.Object({
  id: t.String(),
  shopId: t.String(),
  winemakerId: t.Union([t.String(), t.Null()]),
  dow: t.Integer(),
  startTime: t.Date(),
  endTime: t.Date(),
  validFrom: t.String(),
  validTo: t.Union([t.String(), t.Null()]),
  type: t.String(),
});

export const exceptionResponse = t.Object({
  id: t.String(),
  shopId: t.String(),
  winemakerId: t.Union([t.String(), t.Null()]),
  startsAt: t.Date(),
  endsAt: t.Date(),
  action: t.String(),
  reason: t.Union([t.String(), t.Null()]),
});

export const getAvailabilityResponse = t.Object({
  regular: t.Array(regularResponse),
  exceptions: t.Array(exceptionResponse),
});
