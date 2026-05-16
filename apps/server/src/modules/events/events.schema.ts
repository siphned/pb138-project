import { t } from "elysia";
import { z } from "zod";

/**
 * Request/response schemas for events module.
 * Zod for shared types, TypeBox for Elysia route validation.
 */

// ─── Zod Schemas ──────────────────────────────────────────────────────────

const addressBodySchema = z.object({
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(50),
  houseNumber: z.string().min(1).max(20),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
});

export const createEventBodySchema = z.object({
  address: addressBodySchema,
  capacity: z.number().int().min(1).max(32767),
  description: z.string().min(1).max(10000).optional(),
  endTime: z.string().datetime(),
  inviteType: z.enum(["open", "invite_only"]),
  name: z.string().min(1).max(255),
  startTime: z.string().datetime(),
  visibility: z.enum(["public", "private"]),
});

export const updateEventBodySchema = z.object({
  capacity: z.number().int().min(1).max(32767).optional(),
  description: z.string().min(1).max(10000).nullable().optional(),
  endTime: z.string().datetime().optional(),
  name: z.string().min(1).max(255).optional(),
  startTime: z.string().datetime().optional(),
});

export const listEventsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  q: z.string().max(255).optional(),
  to: z.string().datetime().optional(),
  winemakerId: z.string().optional(),
  winemakerName: z.string().max(255).optional(),
});

export const paginationQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
});

export const createCommentBodySchema = z.object({
  body: z.string().min(1).max(2000),
});

export const eventParamsSchema = z.object({ id: z.string() });

const addressResponseSchema = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

export const eventResponseSchema = z.object({
  address: addressResponseSchema.nullable(),
  addressId: z.string(),
  capacity: z.number(),
  createdAt: z.date(),
  description: z.string().nullable(),
  endTime: z.date(),
  id: z.string(),
  inviteType: z.string(),
  name: z.string(),
  startTime: z.date(),
  status: z.enum(["pending", "approved", "rejected"]),
  updatedAt: z.date().nullable(),
  visibility: z.enum(["public", "private"]),
  winemaker: z.object({ id: z.string(), name: z.string() }).nullable(),
  winemakerId: z.string(),
});

export const paginatedEventsResponseSchema = z.object({
  data: z.array(eventResponseSchema),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
});

export const registrationResponseSchema = z.object({
  createdAt: z.date(),
  eventId: z.string(),
  id: z.string(),
  userId: z.string(),
});

const commentWithUserResponseSchema = z.object({
  body: z.string(),
  createdAt: z.date(),
  eventId: z.string(),
  id: z.string(),
  user: z.object({ fname: z.string(), id: z.string(), lname: z.string() }),
  userId: z.string(),
});

export const commentResponseSchema = z.object({
  body: z.string(),
  createdAt: z.date(),
  eventId: z.string(),
  id: z.string(),
  userId: z.string(),
});

export const paginatedCommentsResponseSchema = z.object({
  data: z.array(commentWithUserResponseSchema),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
});

// ─── TypeBox Schemas ──────────────────────────────────────────────────────

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
  q: t.Optional(t.String({ maxLength: 255 })),
  to: t.Optional(t.String({ format: "date-time" })),
  winemakerId: t.Optional(t.String()),
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

export const invitationResponse = t.Object({
  createdAt: t.Date(),
  deletedAt: t.Nullable(t.Date()),
  email: t.String(),
  eventId: t.String(),
  expiresAt: t.Date(),
  id: t.String(),
  token: t.String(),
  updatedAt: t.Nullable(t.Date()),
});
