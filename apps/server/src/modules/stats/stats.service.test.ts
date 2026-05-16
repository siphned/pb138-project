// apps/server/src/modules/stats/stats.service.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import * as statsRepo from "./stats.repository";

vi.mock("./stats.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./stats.repository")>();
  return {
    ...actual,
    getAdminStats: vi.fn(),
    getCustomerStats: vi.fn(),
    getShopOwnerStats: vi.fn(),
    getWinemakerStats: vi.fn(),
  };
});

vi.mock("../winemakers/winemakers.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../winemakers/winemakers.repository")>();
  return { ...actual, findByUserId: vi.fn() };
});

import { statsService } from "./stats.service";

const userId = "11111111-1111-1111-1111-111111111111";
const winemakerId = "22222222-2222-2222-2222-222222222222";

const mockCustomerStats = {
  eventsAttended: 2,
  ordersCount: 3,
  reviewsWritten: 1,
  role: "customer" as const,
  totalSpent: 150.0,
};

const mockWinemakerStats = {
  avgReviewScore: 4.5,
  eventsByStatus: { approved: 2, pending: 1, rejected: 0 },
  role: "winemaker" as const,
  supplyAgreementsByStatus: { approved: 3, pending: 0, rejected: 1 },
  totalStock: 100,
  wineCount: 5,
};

const mockShopOwnerStats = {
  orderItemsProcessed: 42,
  productsByType: { bundles: 3, standard: 10 },
  revenue: 1200.0,
  role: "shop_owner" as const,
  shopsCount: 2,
  supplyAgreementsByStatus: { approved: 2, pending: 1, rejected: 0 },
  totalStockValue: 5000.0,
};

const mockAdminStats = {
  deletedReviews: 7,
  pendingEvents: 2,
  pendingRoleRequests: 3,
  role: "admin" as const,
  totalEvents: 15,
  totalProducts: 200,
  totalRevenue: 50000.0,
  totalShops: 5,
  totalWinemakers: 10,
  usersByRole: { admin: 2, customer: 100, shop_owner: 5, winemaker: 10 },
};

beforeEach(() => vi.clearAllMocks());

describe("getStats — customer", () => {
  it("returns customer stats for any authenticated user", async () => {
    vi.mocked(statsRepo.getCustomerStats).mockResolvedValue(mockCustomerStats);

    const result = await statsService.getStats(userId, "customer", []);

    expect(result).toEqual(mockCustomerStats);
    expect(statsRepo.getCustomerStats).toHaveBeenCalledWith(expect.anything(), userId);
  });
});

describe("getStats — winemaker", () => {
  it("throws ForbiddenError when caller lacks winemaker role", async () => {
    await expect(statsService.getStats(userId, "winemaker", ["customer"])).rejects.toThrow(
      "You do not have access to these stats"
    );
  });

  it("throws NotFoundError when winemaker profile does not exist", async () => {
    vi.mocked(winemakersRepo.findByUserId).mockResolvedValue(undefined);

    await expect(statsService.getStats(userId, "winemaker", ["winemaker"])).rejects.toThrow(
      "Winemaker profile not found"
    );
  });

  it("returns winemaker stats when caller has winemaker role", async () => {
    vi.mocked(winemakersRepo.findByUserId).mockResolvedValue({
      id: winemakerId,
    } as never);
    vi.mocked(statsRepo.getWinemakerStats).mockResolvedValue(mockWinemakerStats);

    const result = await statsService.getStats(userId, "winemaker", ["winemaker"]);

    expect(result).toEqual(mockWinemakerStats);
    expect(statsRepo.getWinemakerStats).toHaveBeenCalledWith(expect.anything(), winemakerId);
  });
});

describe("getStats — shop_owner", () => {
  it("throws ForbiddenError when caller lacks shop_owner role", async () => {
    await expect(statsService.getStats(userId, "shop_owner", ["customer"])).rejects.toThrow(
      "You do not have access to these stats"
    );
  });

  it("returns shop owner stats when caller has shop_owner role", async () => {
    vi.mocked(statsRepo.getShopOwnerStats).mockResolvedValue(mockShopOwnerStats);

    const result = await statsService.getStats(userId, "shop_owner", ["shop_owner"]);

    expect(result).toEqual(mockShopOwnerStats);
    expect(statsRepo.getShopOwnerStats).toHaveBeenCalledWith(expect.anything(), userId);
  });
});

describe("getStats — admin", () => {
  it("throws ForbiddenError when caller lacks admin role", async () => {
    await expect(statsService.getStats(userId, "admin", ["customer"])).rejects.toThrow(
      "You do not have access to these stats"
    );
  });

  it("returns admin stats when caller has admin role", async () => {
    vi.mocked(statsRepo.getAdminStats).mockResolvedValue(mockAdminStats);

    const result = await statsService.getStats(userId, "admin", ["admin"]);

    expect(result).toEqual(mockAdminStats);
    expect(statsRepo.getAdminStats).toHaveBeenCalledWith(expect.anything());
  });
});
