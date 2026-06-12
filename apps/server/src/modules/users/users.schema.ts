import { z } from "zod";

export const userResponseSchema = z.object({
  billingAddressId: z.string().nullable(),
  clerkId: z.string(),
  createdAt: z.date(),
  email: z.string(),
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
  roles: z.array(z.string()),
  shippingAddressId: z.string().nullable(),
});

export const updateProfileBody = z.object({
  fname: z.string().min(1).max(30).optional(),
  lname: z.string().min(1).max(30).optional(),
});

export const addressBody = z.object({
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(50),
  houseNumber: z.string().min(1).max(20),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
  type: z.enum(["shipping", "billing"]),
});

export const addressResponseSchema = z.object({
  city: z.string(),
  country: z.string(),
  createdAt: z.date(),
  houseNumber: z.string(),
  id: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

export const addressesResponseSchema = z.object({
  billing: addressResponseSchema.nullable(),
  shipping: addressResponseSchema.nullable(),
});
