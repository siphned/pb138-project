import { t } from "elysia";
import z from "zod";

/**
 * Admin API response schemas.
 * Zod schemas are exported for shared types and OpenAPI generation.
 * TypeBox schemas (t.*) are provided for Elysia route validation.
 */

export const adminUserResponseSchema = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  email: z.string(),
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
  role: z.string(),
  status: z.string(),
});

export const adminEventResponseSchema = z.object({
  address: z.nullable(
    z.object({
      city: z.string(),
      country: z.string(),
      houseNumber: z.string(),
      postalCode: z.string(),
      street: z.string(),
    })
  ),
  addressId: z.string(),
  endTime: z.date(),
  id: z.string(),
  name: z.string(),
  startTime: z.date(),
  status: z.string(),
  winemaker: z.nullable(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  winemakerId: z.string(),
});

export const adminReviewResponseSchema = z.object({
  body: z.string().nullable(),
  createdAt: z.date(),
  entityId: z.string(),
  entityType: z.string(),
  id: z.string(),
  rating: z.number(),
  user: z.nullable(
    z.object({
      fname: z.string(),
      id: z.string(),
      lname: z.string(),
    })
  ),
  userId: z.string(),
});

export const adminStatsResponseSchema = z.object({
  events: z.number(),
  reviews: z.number(),
  users: z.number(),
});

/**
 * TypeBox schemas for Elysia route validation.
 * Mirrors Zod schemas above for route compatibility.
 */
export const adminUserResponse = t.Object({
  createdAt: t.Date(),
  deletedAt: t.Nullable(t.Date()),
  email: t.String(),
  fname: t.String(),
  id: t.String(),
  lname: t.String(),
  role: t.String(),
  status: t.String(),
});

export const adminEventResponse = t.Object({
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
  endTime: t.Date(),
  id: t.String(),
  name: t.String(),
  startTime: t.Date(),
  status: t.String(),
  winemaker: t.Nullable(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
  winemakerId: t.String(),
});

export const adminReviewResponse = t.Object({
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
  entityId: t.String(),
  entityType: t.String(),
  id: t.String(),
  rating: t.Number(),
  user: t.Nullable(
    t.Object({
      fname: t.String(),
      id: t.String(),
      lname: t.String(),
    })
  ),
  userId: t.String(),
});

export const adminStatsResponse = t.Object({
  events: t.Number(),
  reviews: t.Number(),
  users: t.Number(),
});
