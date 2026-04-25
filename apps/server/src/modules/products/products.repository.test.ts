import { beforeEach, describe, expect, it, vi } from "vitest";
import { productsRepository } from "./products.repository";
import { db } from "../../db";
import { products, productWines, wines } from "../../db/schema";

vi.mock("../../db", () => {
  const mockDb = {
    transaction: vi.fn((cb) => cb(mockDb)),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    for: vi.fn().mockReturnThis(),
    query: {
      products: {
        findFirst: vi.fn(),
      },
    },
  };
  return { db: mockDb };
});

describe("productsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProductWithWine", () => {
    it("successfully creates product and decrements wine quantity", async () => {
      // 1. Mock select for stock check
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([{ quantity: 100 }]),
      } as any);

      // 2. Mock product insert
      vi.mocked(db.returning).mockResolvedValueOnce([{ id: "p1", name: "Wine Product" }]);

      const result = await productsRepository.createProductWithWine(
        "s1",
        { name: "Wine Product", price: "10", quantity: 5 },
        "w1"
      );

      expect(result.id).toBe("p1");
      
      // Check stock decrement call
      expect(db.update).toHaveBeenCalledWith(wines);
      expect(db.set).toHaveBeenCalled(); // should use sql decrement
    });

    it("throws NOT_ENOUGH_STOCK if wine quantity is insufficient", async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([{ quantity: 2 }]),
      } as any);

      await expect(
        productsRepository.createProductWithWine(
          "s1",
          { name: "Product", price: "10", quantity: 5 },
          "w1"
        )
      ).rejects.toThrow("NOT_ENOUGH_STOCK");
    });
  });

  describe("createBundleWithWines", () => {
    it("successfully creates bundle and decrements multiple wines", async () => {
      // Mock select for 2 wines
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          for: vi.fn().mockResolvedValue([{ quantity: 10 }]),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          for: vi.fn().mockResolvedValue([{ quantity: 20 }]),
        } as any);

      vi.mocked(db.returning).mockResolvedValueOnce([{ id: "b1", isBundle: true }]);

      const result = await productsRepository.createBundleWithWines(
        "s1",
        { name: "Bundle", price: "50", quantity: 2 },
        [
          { wineId: "w1", quantity: 1 },
          { wineId: "w2", quantity: 2 },
        ]
      );

      expect(result.id).toBe("b1");
      expect(db.update).toHaveBeenCalledTimes(2);
    });
  });
});
