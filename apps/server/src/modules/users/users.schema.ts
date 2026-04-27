import { t } from "elysia";

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
