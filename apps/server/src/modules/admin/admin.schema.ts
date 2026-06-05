import { z } from "zod";

/**
 * Response schemas for admin module.
 * Mirrors the AdminUserRow, AdminEventRow, AdminReviewRow types from admin.repository.ts
 */

const adminAddress = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

const adminWinemaker = z.object({
  id: z.string(),
  name: z.string(),
});

export const adminEvent = z.object({
  address: adminAddress.nullable(),
  addressId: z.string(),
  capacity: z.number(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  description: z.string().nullable(),
  endTime: z.date(),
  id: z.string(),
  inviteType: z.string(),
  name: z.string(),
  startTime: z.date(),
  status: z.enum(["pending", "approved", "rejected"]),
  updatedAt: z.date().nullable(),
  visibility: z.string(),
  winemaker: adminWinemaker.nullable(),
  winemakerId: z.string(),
});

export const adminEventListResponse = z.object({
  data: z.array(adminEvent),
  total: z.number(),
});

const adminUserRole = z.object({
  id: z.string(),
  role: z.string(),
});

export const adminUser = z.object({
  billingAddressId: z.string().nullable(),
  clerkId: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  email: z.string(),
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
  roles: z.array(adminUserRole),
  shippingAddressId: z.string().nullable(),
  status: z.enum(["active", "suspended", "banned"]),
  updatedAt: z.date().nullable(),
});

export const adminUserListResponse = z.object({
  data: z.array(adminUser),
  total: z.number(),
});

const adminReviewUser = z.object({
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
});

export const adminReview = z.object({
  body: z.string().nullable(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  entityId: z.string(),
  entityType: z.string(),
  id: z.string(),
  rating: z.number(),
  updatedAt: z.date().nullable(),
  user: adminReviewUser.nullable(),
  userId: z.string(),
});

export const adminReviewListResponse = z.object({
  data: z.array(adminReview),
  total: z.number(),
});

export const adminDeleteResponse = z.object({
  success: z.boolean(),
});
