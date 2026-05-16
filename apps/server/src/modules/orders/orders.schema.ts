import { t } from "elysia";
import z from "zod";

/**
 * Request/response schemas for orders module.
 * Zod for shared types, TypeBox for Elysia route validation.
 */

const addressInputSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  houseNumber: z.string().min(1),
  postalCode: z.string().min(1),
  street: z.string().min(1),
});

export const checkoutBodySchema = z.object({
  billingAddressId: z.string().uuid().optional(),
  deliveryType: z.enum(["pickup", "shipping"]),
  newBillingAddress: addressInputSchema.optional(),
  newShippingAddress: addressInputSchema.optional(),
  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),
  shippingAddressId: z.string().uuid().optional(),
});

export const orderItemResponseSchema = z.object({
  createdAt: z.date(),
  id: z.string(),
  orderId: z.string(),
  product: z.object({ id: z.string(), name: z.string() }),
  productId: z.string(),
  quantity: z.number().int(),
  shopId: z.string(),
  status: z.string(),
  unitPriceAtPurchase: z.string(),
  updatedAt: z.union([z.date(), z.null()]),
});

export const orderResponseSchema = z.object({
  billingAddressId: z.string(),
  createdAt: z.date(),
  deletedAt: z.union([z.date(), z.null()]),
  deliveryType: z.string(),
  discount: z.string(),
  id: z.string(),
  items: z.array(orderItemResponseSchema),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  shippingAddressId: z.string(),
  shippingFee: z.string(),
  status: z.string(),
  totalPrice: z.string(),
  updatedAt: z.union([z.date(), z.null()]),
  userId: z.string(),
});

export const updateItemStatusBodySchema = z.object({
  status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]),
});

const addressInput = t.Object({
  city: t.String({ minLength: 1 }),
  country: t.String({ minLength: 1 }),
  houseNumber: t.String({ minLength: 1 }),
  postalCode: t.String({ minLength: 1 }),
  street: t.String({ minLength: 1 }),
});

export const checkoutBody = t.Object({
  billingAddressId: t.Optional(t.String({ format: "uuid" })),
  deliveryType: t.Union([t.Literal("pickup"), t.Literal("shipping")]),
  newBillingAddress: t.Optional(addressInput),
  newShippingAddress: t.Optional(addressInput),
  paymentMethod: t.Union([
    t.Literal("card"),
    t.Literal("bank_transfer"),
    t.Literal("cash_on_delivery"),
  ]),
  shippingAddressId: t.Optional(t.String({ format: "uuid" })),
});

export const orderItemResponse = t.Object({
  createdAt: t.Date(),
  id: t.String(),
  orderId: t.String(),
  product: t.Object({ id: t.String(), name: t.String() }),
  productId: t.String(),
  quantity: t.Integer(),
  shopId: t.String(),
  status: t.String(),
  unitPriceAtPurchase: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
});

export const orderResponse = t.Object({
  billingAddressId: t.String(),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  deliveryType: t.String(),
  discount: t.String(),
  id: t.String(),
  items: t.Array(orderItemResponse),
  paymentMethod: t.String(),
  paymentStatus: t.String(),
  shippingAddressId: t.String(),
  shippingFee: t.String(),
  status: t.String(),
  totalPrice: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  userId: t.String(),
});

export const updateItemStatusBody = t.Object({
  status: t.Union([
    t.Literal("confirmed"),
    t.Literal("shipped"),
    t.Literal("delivered"),
    t.Literal("cancelled"),
  ]),
});
