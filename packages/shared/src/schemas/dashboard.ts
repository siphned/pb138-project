import { z } from "zod";

/**
 * Dashboard statistics schema.
 * User-specific analytics for homepage/profile dashboard.
 */

export const dashboardStatsSchema = z.object({
  eventsAttended: z.number().int().nonnegative(),
  revenue: z.number().nonnegative().optional(), // for winemakers/shop owners
  totalOrders: z.number().int().nonnegative(),
  wineCount: z.number().int().nonnegative().optional(), // for winemakers
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
