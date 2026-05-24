import { t } from "elysia";
<<<<<<< HEAD
import z from "zod";

/**
 * Response schemas for admin module.
 * Mirrors the AdminUserRow, AdminEventRow, AdminReviewRow types from admin.repository.ts
 */

// ─── Address Schema ───────────────────────────────────────────────────────

const adminAddressZod = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

const adminAddress = t.Object({
  city: t.String(),
  country: t.String(),
  houseNumber: t.String(),
  postalCode: t.String(),
  street: t.String(),
});

// ─── Winemaker Schema ───────────────────────────────────────────────────

const adminWinemakerZod = z.object({
  id: z.string(),
  name: z.string(),
});

const adminWinemaker = t.Object({
  id: t.String(),
  name: t.String(),
});

// ─── Event Schema ───────────────────────────────────────────────────────

const adminEventZod = z.object({
  address: z.union([adminAddressZod, z.null()]),
  addressId: z.string(),
  capacity: z.number(),
  createdAt: z.date(),
  deletedAt: z.union([z.date(), z.null()]),
  description: z.union([z.string(), z.null()]),
  endTime: z.date(),
  id: z.string(),
  inviteType: z.string(),
  name: z.string(),
  startTime: z.date(),
  status: z.enum(["pending", "approved", "rejected"]),
  updatedAt: z.union([z.date(), z.null()]),
  visibility: z.string(),
  winemaker: z.union([adminWinemakerZod, z.null()]),
  winemakerId: z.string(),
});

const adminEvent = t.Object({
  address: t.Union([adminAddress, t.Null()]),
  addressId: t.String(),
  capacity: t.Number(),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  description: t.Union([t.String(), t.Null()]),
  endTime: t.Date(),
  id: t.String(),
  inviteType: t.String(),
  name: t.String(),
  startTime: t.Date(),
  status: t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")]),
  updatedAt: t.Union([t.Date(), t.Null()]),
  visibility: t.String(),
  winemaker: t.Union([adminWinemaker, t.Null()]),
  winemakerId: t.String(),
});

const adminEventListResponseZod = z.object({
  data: z.array(adminEventZod),
  total: z.number(),
});

const adminEventListResponse = t.Object({
  data: t.Array(adminEvent),
  total: t.Number(),
});

// ─── User Schema ───────────────────────────────────────────────────────

const adminUserRoleZod = z.object({
  id: z.string(),
  role: z.string(),
});

const adminUserRole = t.Object({
  id: t.String(),
  role: t.String(),
});

const adminUserZod = z.object({
  billingAddressId: z.union([z.string(), z.null()]),
  clerkId: z.string(),
  createdAt: z.date(),
  deletedAt: z.union([z.date(), z.null()]),
  email: z.string(),
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
  roles: z.array(adminUserRoleZod),
  shippingAddressId: z.union([z.string(), z.null()]),
  status: z.enum(["active", "suspended", "banned"]),
  updatedAt: z.union([z.date(), z.null()]),
});

const adminUser = t.Object({
  billingAddressId: t.Union([t.String(), t.Null()]),
  clerkId: t.String(),
=======

export const adminUserResponse = t.Object({
>>>>>>> origin/main
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  email: t.String(),
  fname: t.String(),
  id: t.String(),
  lname: t.String(),
<<<<<<< HEAD
  roles: t.Array(adminUserRole),
  shippingAddressId: t.Union([t.String(), t.Null()]),
  status: t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")]),
  updatedAt: t.Union([t.Date(), t.Null()]),
});

const adminUserListResponseZod = z.object({
  data: z.array(adminUserZod),
  total: z.number(),
});

const adminUserListResponse = t.Object({
  data: t.Array(adminUser),
  total: t.Number(),
});

// ─── Review Schema ───────────────────────────────────────────────────

const adminReviewUserZod = z.object({
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
});

const adminReviewUser = t.Object({
  fname: t.String(),
  id: t.String(),
  lname: t.String(),
});

const adminReviewZod = z.object({
  body: z.union([z.string(), z.null()]),
  createdAt: z.date(),
  deletedAt: z.union([z.date(), z.null()]),
  entityId: z.string(),
  entityType: z.string(),
  id: z.string(),
  rating: z.number(),
  updatedAt: z.union([z.date(), z.null()]),
  user: z.union([adminReviewUserZod, z.null()]),
  userId: z.string(),
});

const adminReview = t.Object({
  body: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
=======
  role: t.String(),
  status: t.String(),
});

export const adminEventResponse = t.Object({
  address: t.Nullable(
    t.Object({
      city: t.String(),
      country: t.String(),
      houseNumber: t.String(),
      postalCode: t.String(),
      street: t.String(),
    })
  ),
  addressId: t.String(),
  endTime: t.Date(),
  id: t.String(),
  name: t.String(),
  startTime: t.Date(),
  status: t.String(),
  winemaker: t.Nullable(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
  winemakerId: t.String(),
});

export const adminReviewResponse = t.Object({
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
>>>>>>> origin/main
  entityId: t.String(),
  entityType: t.String(),
  id: t.String(),
  rating: t.Number(),
<<<<<<< HEAD
  updatedAt: t.Union([t.Date(), t.Null()]),
  user: t.Union([adminReviewUser, t.Null()]),
  userId: t.String(),
});

const adminReviewListResponseZod = z.object({
  data: z.array(adminReviewZod),
  total: z.number(),
});

const adminReviewListResponse = t.Object({
  data: t.Array(adminReview),
  total: t.Number(),
});

// ─── Success Response ───────────────────────────────────────────────────

const adminDeleteResponseZod = z.object({
  success: z.boolean(),
});

const adminDeleteResponse = t.Object({
  success: t.Boolean(),
});

// ─── Exports ───────────────────────────────────────────────────────────

export {
  adminAddress,
  adminAddressZod,
  adminDeleteResponse,
  adminDeleteResponseZod,
  adminEvent,
  adminEventListResponse,
  adminEventListResponseZod,
  adminEventZod,
  adminReview,
  adminReviewListResponse,
  adminReviewListResponseZod,
  adminReviewZod,
  adminUser,
  adminUserListResponse,
  adminUserListResponseZod,
  adminUserRole,
  adminUserRoleZod,
  adminUserZod,
};
=======
  user: t.Nullable(
    t.Object({
      fname: t.String(),
      id: t.String(),
      lname: t.String(),
    })
  ),
  userId: t.String(),
});

export const adminStatsResponse = t.Object({
  events: t.Number(),
  reviews: t.Number(),
  users: t.Number(),
});
>>>>>>> origin/main
