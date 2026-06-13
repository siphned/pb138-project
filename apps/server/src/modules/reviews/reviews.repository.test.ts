import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as reviewsRepo from "./reviews.repository";

interface MockChained {
  from: () => MockChained;
  innerJoin: () => MockChained;
  limit: () => Promise<unknown[]>;
  select: () => MockChained;
  where: () => MockChained;
}

const mockDb = db as unknown as { select: () => MockChained };

vi.mock("../../db", () => {
  const m = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("reviewsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hasPurchasedFromWinemaker", () => {
    it("returns true when a matching delivered order exists", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce([{ id: "oi1" }]),
        where: vi.fn().mockReturnThis(),
      } as any);

      const result = await reviewsRepo.hasPurchasedFromWinemaker(db, "u1", "wm1");

      expect(result).toBe(true);
    });

    it("returns false when no matching order exists", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce([]),
        where: vi.fn().mockReturnThis(),
      } as any);

      const result = await reviewsRepo.hasPurchasedFromWinemaker(db, "u1", "wm1");

      expect(result).toBe(false);
    });
  });

  describe("averageShopRating", () => {
    it("parses the aggregate average across the shop's products", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce([{ avg: "4.25" }]),
      } as any);

      const result = await reviewsRepo.averageShopRating(db, "s1");

      expect(result).toBe(4.25);
    });

    it("returns null when the shop has no reviews", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce([{ avg: null }]),
      } as any);

      const result = await reviewsRepo.averageShopRating(db, "s1");

      expect(result).toBeNull();
    });
  });

  describe("countShopReviews", () => {
    it("returns the aggregate review count", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce([{ count: 15 }]),
      } as any);

      const result = await reviewsRepo.countShopReviews(db, "s1");

      expect(result).toBe(15);
    });
  });

  describe("findShopReviews", () => {
    it("maps joined rows into the ReviewWithUser shape", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi
          .fn()
          .mockResolvedValueOnce([
            { review: { id: "r1", rating: 5 }, user: { fname: "A", id: "u1", lname: "B" } },
          ]),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as any);

      const result = await reviewsRepo.findShopReviews(db, "s1", {
        limit: 10,
        offset: 0,
        sort: "newest",
      });

      expect(result).toEqual([{ id: "r1", rating: 5, user: { fname: "A", id: "u1", lname: "B" } }]);
    });
  });
});
