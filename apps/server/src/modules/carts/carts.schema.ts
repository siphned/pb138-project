import { t } from "elysia";
import { z } from "zod";

/**
 * Request/response schemas for carts module.
 * Zod for shared types, TypeBox for Elysia route validation.
 */

// ─── Zod Schemas ──────────────────────────────────────────────────────────

const cartProductResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().int(),
  shopId: z.string(),
});

export const cartItemResponseSchema = z.object({
  cartId: z.string(),
  createdAt: z.date(),
  id: z.string(),
  product: cartProductResponseSchema,
  productId: z.string(),
  quantity: z.number().int(),
  updatedAt: z.date(),
});

export const cartResponseSchema = z.object({
  createdAt: z.date(),
  id: z.string(),
  items: z.array(cartItemResponseSchema),
  updatedAt: z.date(),
  userId: z.string(),
});

export const addItemBodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const updateItemBodySchema = z.object({
  quantity: z.number().int().min(1),
});

export const mergeBodySchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    }),
    { min: 1 }
  ),
});

// ─── TypeBox Schemas ──────────────────────────────────────────────────────

const cartProductResponse = t.Object({
  id: t.String(),
  name: t.String(),
  price: t.String(),
  quantity: t.Integer(),
  shopId: t.String(),
});

export const cartItemResponse = t.Object({
  cartId: t.String(),
  createdAt: t.Date(),
  id: t.String(),
  product: cartProductResponse,
  productId: t.String(),
  quantity: t.Integer(),
  updatedAt: t.Date(),
});

export const cartResponse = t.Object({
  createdAt: t.Date(),
  id: t.String(),
  items: t.Array(cartItemResponse),
  updatedAt: t.Date(),
  userId: t.String(),
});

export const addItemBody = t.Object({
  productId: t.String({ format: "uuid" }),
  quantity: t.Integer({ minimum: 1 }),
});

export const updateItemBody = t.Object({
  quantity: t.Integer({ minimum: 1 }),
});

export const mergeBody = t.Object({
  items: t.Array(
    t.Object({
      productId: t.String({ format: "uuid" }),
      quantity: t.Integer({ minimum: 1 }),
    }),
    { minItems: 1 }
  ),
});
