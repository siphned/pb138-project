import { z } from "zod";

const cartProductResponse = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().int(),
  shopId: z.string(),
});

export const cartItemResponse = z.object({
  cartId: z.string(),
  createdAt: z.date(),
  id: z.string(),
  product: cartProductResponse,
  productId: z.string(),
  quantity: z.number().int(),
  updatedAt: z.date(),
});

export const cartResponse = z.object({
  createdAt: z.date(),
  id: z.string(),
  items: z.array(cartItemResponse),
  updatedAt: z.date(),
  userId: z.string(),
});

export const addItemBody = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const updateItemBody = z.object({
  quantity: z.number().int().min(1),
});

export const mergeBody = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});
