import { t } from "elysia";

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
