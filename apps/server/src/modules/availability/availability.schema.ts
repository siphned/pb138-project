import { z } from "zod";

export const addRegularBody = z.object({
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

export const addExceptionBody = z.object({
  action: z.enum(["closed", "modified_hours", "special_event"]),
  endsAt: z.string().datetime(),
  reason: z.string().optional(),
  startsAt: z.string().datetime(),
});

export const regularResponse = z.object({
  dow: z.number().int(),
  endTime: z.date(),
  id: z.string(),
  shopId: z.string(),
  startTime: z.date(),
  type: z.string(),
  validFrom: z.string(),
  validTo: z.string().nullable(),
  winemakerId: z.string().nullable(),
});

export const exceptionResponse = z.object({
  action: z.string(),
  endsAt: z.date(),
  id: z.string(),
  reason: z.string().nullable(),
  shopId: z.string(),
  startsAt: z.date(),
  winemakerId: z.string().nullable(),
});

export const getAvailabilityResponse = z.object({
  exceptions: z.array(exceptionResponse),
  regular: z.array(regularResponse),
});
