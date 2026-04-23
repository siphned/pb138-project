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
