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

export const updateItemStatusBody = t.Object({
  status: t.Union([
    t.Literal("confirmed"),
    t.Literal("shipped"),
    t.Literal("delivered"),
    t.Literal("cancelled"),
  ]),
});
