import { t } from "elysia";
import { z } from "zod";

/**
 * Request/response schemas for availability module.
 * Zod for shared types, TypeBox for Elysia route validation.
 */

export const addRegularBodySchema = z.object({
  dow: z.number().int().min(0).max(6),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  type: z.enum(["open", "closed"]),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const addExceptionBodySchema = z.object({
  action: z.enum(["closed", "modified_hours", "special_event"]),
  endsAt: z.string().datetime(),
  reason: z.string().optional(),
  startsAt: z.string().datetime(),
});

export const regularResponseSchema = z.object({
  dow: z.number().int(),
  endTime: z.date(),
  id: z.string(),
  shopId: z.string(),
  startTime: z.date(),
  type: z.string(),
  validFrom: z.string(),
  validTo: z.union([z.string(), z.null()]),
  winemakerId: z.union([z.string(), z.null()]),
});

export const exceptionResponseSchema = z.object({
  action: z.string(),
  endsAt: z.date(),
  id: z.string(),
  reason: z.union([z.string(), z.null()]),
  shopId: z.string(),
  startsAt: z.date(),
  winemakerId: z.union([z.string(), z.null()]),
});

export const getAvailabilityResponseSchema = z.object({
  exceptions: z.array(exceptionResponseSchema),
  regular: z.array(regularResponseSchema),
});

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
