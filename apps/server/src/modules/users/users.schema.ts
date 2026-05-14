import { t } from "elysia";
import { z } from "zod";

/**
 * Request/response schemas for users module.
 * Zod for shared types, TypeBox for Elysia route validation.
 */

export const userResponseSchemaZod = z.object({
  billingAddressId: z.union([z.string(), z.null()]),
  clerkId: z.string(),
  createdAt: z.date(),
  email: z.string(),
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
  roles: z.array(z.string()),
  shippingAddressId: z.union([z.string(), z.null()]),
});

export const updateProfileBodyZod = z.object({
  fname: z.string().min(1).max(30).optional(),
  lname: z.string().min(1).max(30).optional(),
});

export const addressBodyZod = z.object({
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(50),
  houseNumber: z.string().min(1).max(20),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
  type: z.enum(["shipping", "billing"]),
});

export const addressResponseSchemaZod = z.object({
  city: z.string(),
  country: z.string(),
  createdAt: z.date(),
  houseNumber: z.string(),
  id: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

export const addressesResponseSchemaZod = z.object({
  billing: z.union([addressResponseSchemaZod, z.null()]),
  shipping: z.union([addressResponseSchemaZod, z.null()]),
});

export const userResponseSchema = t.Object({
  billingAddressId: t.Union([t.String(), t.Null()]),
  clerkId: t.String(),
  createdAt: t.Date(),
  email: t.String(),
  fname: t.String(),
  id: t.String(),
  lname: t.String(),
  roles: t.Array(t.String()),
  shippingAddressId: t.Union([t.String(), t.Null()]),
});

export const updateProfileBody = t.Object({
  fname: t.Optional(t.String({ maxLength: 30, minLength: 1 })),
  lname: t.Optional(t.String({ maxLength: 30, minLength: 1 })),
});

export const addressBody = t.Object({
  city: t.String({ maxLength: 255, minLength: 1 }),
  country: t.String({ maxLength: 50, minLength: 1 }),
  houseNumber: t.String({ maxLength: 20, minLength: 1 }),
  postalCode: t.String({ maxLength: 20, minLength: 1 }),
  street: t.String({ maxLength: 255, minLength: 1 }),
  type: t.Union([t.Literal("shipping"), t.Literal("billing")]),
});

export const addressResponseSchema = t.Object({
  city: t.String(),
  country: t.String(),
  createdAt: t.Date(),
  houseNumber: t.String(),
  id: t.String(),
  postalCode: t.String(),
  street: t.String(),
});

export const addressesResponseSchema = t.Object({
  billing: t.Union([addressResponseSchema, t.Null()]),
  shipping: t.Union([addressResponseSchema, t.Null()]),
});
