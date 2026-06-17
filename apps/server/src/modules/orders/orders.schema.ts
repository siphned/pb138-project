import { z } from "zod";

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
  updatedAt: z.date().nullable(),
});

export const orderResponseSchema = z.object({
  billingAddressId: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
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
  updatedAt: z.date().nullable(),
  userId: z.string(),
});

export const updateItemStatusBodySchema = z.object({
  status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]),
});
