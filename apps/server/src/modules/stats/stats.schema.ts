import { z } from "zod";

export const customerStatsSchema = z.object({
  role: z.literal("customer"),
  ordersCount: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  eventsAttended: z.number().int().nonnegative(),
  reviewsWritten: z.number().int().nonnegative(),
});

export const winemakerStatsSchema = z.object({
  role: z.literal("winemaker"),
  wineCount: z.number().int().nonnegative(),
  totalStock: z.number().int().nonnegative(),
  eventsByStatus: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  supplyAgreementsByStatus: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  avgReviewScore: z.number().nonnegative().nullable(),
});

export const shopOwnerStatsSchema = z.object({
  role: z.literal("shop_owner"),
  shopsCount: z.number().int().nonnegative(),
  productsByType: z.object({
    standard: z.number().int().nonnegative(),
    bundles: z.number().int().nonnegative(),
  }),
  totalStockValue: z.number().nonnegative(),
  orderItemsProcessed: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  supplyAgreementsByStatus: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
});

export const adminStatsSchema = z.object({
  role: z.literal("admin"),
  usersByRole: z.object({
    customer: z.number().int().nonnegative(),
    winemaker: z.number().int().nonnegative(),
    shop_owner: z.number().int().nonnegative(),
    admin: z.number().int().nonnegative(),
  }),
  totalRevenue: z.number().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  totalShops: z.number().int().nonnegative(),
  totalWinemakers: z.number().int().nonnegative(),
  totalEvents: z.number().int().nonnegative(),
  pendingRoleRequests: z.number().int().nonnegative(),
  pendingEvents: z.number().int().nonnegative(),
  deletedReviews: z.number().int().nonnegative(),
});

export const statsResponseSchema = z.discriminatedUnion("role", [
  customerStatsSchema,
  winemakerStatsSchema,
  shopOwnerStatsSchema,
  adminStatsSchema,
]);

export type CustomerStats = z.infer<typeof customerStatsSchema>;
export type WinemakerStats = z.infer<typeof winemakerStatsSchema>;
export type ShopOwnerStats = z.infer<typeof shopOwnerStatsSchema>;
export type AdminStats = z.infer<typeof adminStatsSchema>;
export type StatsResponse = z.infer<typeof statsResponseSchema>;