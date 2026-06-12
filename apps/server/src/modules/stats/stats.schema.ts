import { z } from "zod";

export const customerStatsSchema = z.object({
  eventsAttended: z.number().int().nonnegative(),
  ordersCount: z.number().int().nonnegative(),
  reviewsWritten: z.number().int().nonnegative(),
  role: z.literal("customer"),
  totalSpent: z.number().nonnegative(),
});

export const winemakerStatsSchema = z.object({
  avgReviewScore: z.number().nonnegative().nullable(),
  eventsByStatus: z.object({
    approved: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  role: z.literal("winemaker"),
  supplyAgreementsByStatus: z.object({
    approved: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  totalStock: z.number().int().nonnegative(),
  wineCount: z.number().int().nonnegative(),
});

export const shopOwnerStatsSchema = z.object({
  orderItemsProcessed: z.number().int().nonnegative(),
  productsByType: z.object({
    bundles: z.number().int().nonnegative(),
    standard: z.number().int().nonnegative(),
  }),
  revenue: z.number().nonnegative(),
  role: z.literal("shop_owner"),
  shopsCount: z.number().int().nonnegative(),
  supplyAgreementsByStatus: z.object({
    approved: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  totalStockValue: z.number().nonnegative(),
});

export const adminStatsSchema = z.object({
  deletedReviews: z.number().int().nonnegative(),
  pendingEvents: z.number().int().nonnegative(),
  pendingRoleRequests: z.number().int().nonnegative(),
  role: z.literal("admin"),
  totalEvents: z.number().int().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  totalShops: z.number().int().nonnegative(),
  totalWinemakers: z.number().int().nonnegative(),
  usersByRole: z.object({
    admin: z.number().int().nonnegative(),
    customer: z.number().int().nonnegative(),
    shop_owner: z.number().int().nonnegative(),
    winemaker: z.number().int().nonnegative(),
  }),
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
