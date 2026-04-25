import { t } from "elysia";

const addressInput = t.Object({
  country: t.String({ minLength: 1 }),
  city: t.String({ minLength: 1 }),
  street: t.String({ minLength: 1 }),
  postalCode: t.String({ minLength: 1 }),
  houseNumber: t.String({ minLength: 1 }),
});

export const checkoutBody = t.Object({
  paymentMethod: t.Union([
    t.Literal("card"),
    t.Literal("bank_transfer"),
    t.Literal("cash_on_delivery"),
  ]),
  deliveryType: t.Union([t.Literal("pickup"), t.Literal("shipping")]),
  shippingAddressId: t.Optional(t.String({ format: "uuid" })),
  newShippingAddress: t.Optional(addressInput),
  billingAddressId: t.Optional(t.String({ format: "uuid" })),
  newBillingAddress: t.Optional(addressInput),
});

export const orderItemResponse = t.Object({
  id: t.String(),
  orderId: t.String(),
  shopId: t.String(),
  productId: t.String(),
  quantity: t.Integer(),
  unitPriceAtPurchase: t.String(),
  status: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  product: t.Object({ id: t.String(), name: t.String() }),
});

export const orderResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  status: t.String(),
  paymentStatus: t.String(),
  paymentMethod: t.String(),
  deliveryType: t.String(),
  totalPrice: t.String(),
  shippingFee: t.String(),
  discount: t.String(),
  shippingAddressId: t.String(),
  billingAddressId: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  deletedAt: t.Union([t.Date(), t.Null()]),
  items: t.Array(orderItemResponse),
});

export const updateItemStatusBody = t.Object({
  status: t.Union([
    t.Literal("confirmed"),
    t.Literal("shipped"),
    t.Literal("delivered"),
    t.Literal("cancelled"),
  ]),
});
