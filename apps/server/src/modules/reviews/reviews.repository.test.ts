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
});
