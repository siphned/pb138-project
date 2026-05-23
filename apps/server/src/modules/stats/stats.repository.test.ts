import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as statsRepo from "./stats.repository";

// ── Hoisted mock references ────────────────────────────────────
const { mockResults } = vi.hoisted(() => ({
  mockResults: { callIndex: 0, results: [] as any[][] },
}));

function nextResult(): any[] {
  return mockResults.results[mockResults.callIndex++] ?? [{ value: 0 }];
}

/**
 * Create a Drizzle-like query builder that supports arbitrary chain length:
 *   db.select(…).from(…).where(…).groupBy(…)
 *   db.select(…).from(…).innerJoin(…).where(…)
 *
 * Every method returns `builder` so chains keep working, and the builder
 * itself is thenable — awaiting it resolves to the pre-registered result.
 */
function createQueryBuilder(): any {
  const builder = Promise.resolve(nextResult());
  // Make the builder an opaque thenable that Drizzle-compatible code can
  // chain on without caring about return types.
  (builder as any).from = vi.fn().mockReturnValue(builder);
  (builder as any).where = vi.fn().mockReturnValue(builder);
  (builder as any).groupBy = vi.fn().mockReturnValue(builder);
  (builder as any).innerJoin = vi.fn().mockReturnValue(builder);
  return builder;
}

vi.mock("../../db", () => ({
  db: {
    select: vi.fn().mockImplementation(() => createQueryBuilder()),
  },
}));

describe("statsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResults.callIndex = 0;
    mockResults.results = [];
  });

  // ── getCustomerStats ─────────────────────────────────────────

  describe("getCustomerStats", () => {
    it("returns zeroed customer stats when no data", async () => {
      mockResults.results = [
        [{ ordersCount: 0, totalSpent: null }],
        [{ eventsAttended: 0 }],
        [{ reviewsWritten: 0 }],
      ];

      const result = await statsRepo.getCustomerStats(db, "u1");

      expect(result).toEqual({
        eventsAttended: 0,
        ordersCount: 0,
        reviewsWritten: 0,
        role: "customer",
        totalSpent: 0,
      });
    });

    it("returns customer statistics with data", async () => {
      mockResults.results = [
        [{ ordersCount: 5, totalSpent: "1250.50" }],
        [{ eventsAttended: 3 }],
        [{ reviewsWritten: 7 }],
      ];

      const result = await statsRepo.getCustomerStats(db, "u1");

      expect(result.eventsAttended).toBe(3);
      expect(result.ordersCount).toBe(5);
      expect(result.reviewsWritten).toBe(7);
      expect(result.totalSpent).toBe(1250.5);
      expect(result.role).toBe("customer");
    });

    it("handles null totalSpent as zero", async () => {
      mockResults.results = [
        [{ ordersCount: 2, totalSpent: null }],
        [{ eventsAttended: 0 }],
        [{ reviewsWritten: 0 }],
      ];

      const result = await statsRepo.getCustomerStats(db, "u1");

      expect(result.totalSpent).toBe(0);
    });
  });

  // ── getWinemakerStats ────────────────────────────────────────

  describe("getWinemakerStats", () => {
    it("returns zeroed winemaker stats when no data", async () => {
      mockResults.results = [
        [{ totalStock: 0, wineCount: 0 }], // wines query
        [], // events grouped query
        [], // agreements grouped query
        [{ avgScore: null }], // review avg query
      ];

      const result = await statsRepo.getWinemakerStats(db, "wm1");

      expect(result).toEqual({
        avgReviewScore: null,
        eventsByStatus: { approved: 0, pending: 0, rejected: 0 },
        role: "winemaker",
        supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
        totalStock: 0,
        wineCount: 0,
      });
    });

    it("returns winemaker statistics with populated data", async () => {
      mockResults.results = [
        [{ totalStock: 500, wineCount: 10 }],
        [
          { cnt: 3, status: "approved" },
          { cnt: 1, status: "pending" },
          { cnt: 0, status: "rejected" },
        ],
        [
          { cnt: 4, status: "approved" },
          { cnt: 2, status: "pending" },
        ],
        [{ avgScore: "4.2" }],
      ];

      const result = await statsRepo.getWinemakerStats(db, "wm1");

      expect(result.wineCount).toBe(10);
      expect(result.totalStock).toBe(500);
      expect(result.eventsByStatus).toEqual({ approved: 3, pending: 1, rejected: 0 });
      expect(result.supplyAgreementsByStatus).toEqual({
        approved: 4,
        pending: 2,
        rejected: 0,
      });
      expect(result.avgReviewScore).toBe(4.2);
      expect(result.role).toBe("winemaker");
    });

    it("handles missing avgReviewScore", async () => {
      mockResults.results = [[{ totalStock: 0, wineCount: 0 }], [], [], [{ avgScore: null }]];

      const result = await statsRepo.getWinemakerStats(db, "wm1");

      expect(result.avgReviewScore).toBeNull();
    });
  });

  // ── getShopOwnerStats ────────────────────────────────────────

  describe("getShopOwnerStats", () => {
    it("returns empty stats when owner has no shops", async () => {
      // First query: shops lookup returns empty
      mockResults.results = [[]];

      const result = await statsRepo.getShopOwnerStats(db, "u1");

      expect(result).toEqual({
        orderItemsProcessed: 0,
        productsByType: { bundles: 0, standard: 0 },
        revenue: 0,
        role: "shop_owner",
        shopsCount: 0,
        supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
        totalStockValue: 0,
      });
    });

    it("returns shop owner statistics with shops", async () => {
      mockResults.results = [
        // owned shops query
        [{ id: "s1" }, { id: "s2" }],
        // products grouped by isBundle
        [
          { cnt: 5, isBundle: false },
          { cnt: 2, isBundle: true },
        ],
        // stock value query
        [{ totalStockValue: "25000" }],
        // order items count
        [{ orderItemsProcessed: 30 }],
        // revenue query
        [{ revenue: "4500.75" }],
        // agreements grouped by status
        [
          { cnt: 3, status: "approved" },
          { cnt: 1, status: "pending" },
        ],
      ];

      const result = await statsRepo.getShopOwnerStats(db, "u1");

      expect(result.shopsCount).toBe(2);
      expect(result.productsByType).toEqual({ bundles: 2, standard: 5 });
      expect(result.totalStockValue).toBe(25000);
      expect(result.orderItemsProcessed).toBe(30);
      expect(result.revenue).toBe(4500.75);
      expect(result.supplyAgreementsByStatus).toEqual({
        approved: 3,
        pending: 1,
        rejected: 0,
      });
      expect(result.role).toBe("shop_owner");
    });

    it("handles null/missing revenue and stock value", async () => {
      mockResults.results = [
        [{ id: "s1" }],
        [{ cnt: 1, isBundle: false }],
        [{ totalStockValue: null }],
        [{ orderItemsProcessed: 0 }],
        [{ revenue: null }],
        [],
      ];

      const result = await statsRepo.getShopOwnerStats(db, "u1");

      expect(result.totalStockValue).toBe(0);
      expect(result.revenue).toBe(0);
    });
  });

  // ── getAdminStats ─────────────────────────────────────────────

  describe("getAdminStats", () => {
    it("returns zeroed admin stats when no data", async () => {
      // 9 queries in Promise.all
      mockResults.results = [
        [], // roleCountsResult (groupBy)
        [{ totalRevenue: null }], // revenueResult
        [{ cnt: 0 }], // productsCountResult
        [{ cnt: 0 }], // shopsCountResult
        [{ cnt: 0 }], // winemakersCountResult
        [{ cnt: 0 }], // eventsCountResult
        [{ cnt: 0 }], // roleRequestsCountResult
        [{ cnt: 0 }], // pendingEventsCountResult
        [{ cnt: 0 }], // deletedReviewsCountResult
      ];

      const result = await statsRepo.getAdminStats(db);

      expect(result).toEqual({
        deletedReviews: 0,
        pendingEvents: 0,
        pendingRoleRequests: 0,
        role: "admin",
        totalEvents: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalShops: 0,
        totalWinemakers: 0,
        usersByRole: { admin: 0, customer: 0, shop_owner: 0, winemaker: 0 },
      });
    });

    it("returns admin statistics with populated data", async () => {
      mockResults.results = [
        // roleCountsResult (groupBy)
        [
          { cnt: 50, role: "customer" },
          { cnt: 10, role: "winemaker" },
          { cnt: 5, role: "shop_owner" },
          { cnt: 2, role: "admin" },
        ],
        // revenueResult
        [{ totalRevenue: "50000" }],
        // productsCountResult
        [{ cnt: 120 }],
        // shopsCountResult
        [{ cnt: 8 }],
        // winemakersCountResult
        [{ cnt: 10 }],
        // eventsCountResult
        [{ cnt: 15 }],
        // roleRequestsCountResult
        [{ cnt: 3 }],
        // pendingEventsCountResult
        [{ cnt: 2 }],
        // deletedReviewsCountResult
        [{ cnt: 4 }],
      ];

      const result = await statsRepo.getAdminStats(db);

      expect(result.usersByRole).toEqual({
        admin: 2,
        customer: 50,
        shop_owner: 5,
        winemaker: 10,
      });
      expect(result.totalRevenue).toBe(50000);
      expect(result.totalProducts).toBe(120);
      expect(result.totalShops).toBe(8);
      expect(result.totalWinemakers).toBe(10);
      expect(result.totalEvents).toBe(15);
      expect(result.pendingRoleRequests).toBe(3);
      expect(result.pendingEvents).toBe(2);
      expect(result.deletedReviews).toBe(4);
      expect(result.role).toBe("admin");
    });

    it("handles null revenue gracefully", async () => {
      mockResults.results = [
        [],
        [{ totalRevenue: null }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
      ];

      const result = await statsRepo.getAdminStats(db);

      expect(result.totalRevenue).toBe(0);
    });

    it("ignores unknown roles in usersByRole", async () => {
      mockResults.results = [
        [
          { cnt: 1, role: "customer" },
          { cnt: 99, role: "unknown_role" },
        ],
        [{ totalRevenue: null }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
        [{ cnt: 0 }],
      ];

      const result = await statsRepo.getAdminStats(db);

      expect(result.usersByRole).toEqual({
        admin: 0,
        customer: 1,
        shop_owner: 0,
        winemaker: 0,
      });
    });
  });
});
