import { z } from "zod";

export const shopFiltersQuery = z.object({
  city: z.string().max(255).optional(),
  ownerUserId: z.string().optional(),
  q: z.string().max(255).optional(),
});

const addressBody = z.object({
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(50),
  houseNumber: z.string().min(1).max(20),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
});

export const createShopBody = z.object({
  address: addressBody,
  description: z.string().min(1),
  name: z.string().min(1).max(255),
});

export const updateShopBody = z.object({
  address: addressBody.partial().optional(),
  description: z.string().min(1).optional(),
  name: z.string().min(1).max(255).optional(),
});

const addressResponse = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  id: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

export const shopResponse = z.object({
  address: addressResponse,
  createdAt: t.Date(),
  description: t.String(),
  id: t.String(),
  imageUrl: t.Optional(t.Nullable(t.String())),
  name: t.String(),
  ownerUserId: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
});
