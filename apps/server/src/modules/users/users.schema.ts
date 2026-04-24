import { t } from "elysia";

export const userResponseSchema = t.Object({
  id: t.String(),
  clerkId: t.String(),
  fname: t.String(),
  lname: t.String(),
  email: t.String(),
  role: t.Union([t.Literal("user"), t.Literal("admin")]),
  shippingAddressId: t.Union([t.String(), t.Null()]),
  billingAddressId: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
});

export const updateProfileBody = t.Object({
  fname: t.Optional(t.String({ minLength: 1, maxLength: 30 })),
  lname: t.Optional(t.String({ minLength: 1, maxLength: 30 })),
});

export const addressBody = t.Object({
  type: t.Union([t.Literal("shipping"), t.Literal("billing")]),
  country: t.String({ minLength: 1, maxLength: 50 }),
  city: t.String({ minLength: 1, maxLength: 255 }),
  postalCode: t.String({ minLength: 1, maxLength: 20 }),
  street: t.String({ minLength: 1, maxLength: 255 }),
  houseNumber: t.String({ minLength: 1, maxLength: 20 }),
});

export const addressResponseSchema = t.Object({
  id: t.String(),
  country: t.String(),
  city: t.String(),
  postalCode: t.String(),
  street: t.String(),
  houseNumber: t.String(),
  createdAt: t.Date(),
});

export const addressesResponseSchema = t.Object({
  shipping: t.Union([addressResponseSchema, t.Null()]),
  billing: t.Union([addressResponseSchema, t.Null()]),
});
