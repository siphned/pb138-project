import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { products, wines } from "../../db/schema";
import { productsRepository } from "./products.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  for: () => Promise<unknown[]>;
  returning: () => Promise<unknown[]>;
  values: () => MockChained;
  onConflictDoUpdate: () => MockChained;
  set: () => MockChained;
}

interface MockDatabase {
  select: () => MockChained;
  insert: () => MockChained;
  update: () => MockChained;
  delete: () => MockChained;
  returning: () => Promise<unknown[]>;
  onConflictDoUpdate: () => MockChained;
  set: () => MockChained;
  where: () => MockChained;
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    as: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    for: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    query: {
      products: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(m)),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("productsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProductWithWine", () => {
    it("successfully creates product and decrements wine quantity", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        for: vi.fn().mockResolvedValue([{ quantity: 100 }]),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as unknown as MockChained);

      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "p1", name: "Wine Product" }]);

      const result = await productsRepository.createProductWithWine(
        "s1",
        { name: "Wine Product", price: "10", quantity: 5 },
        "w1"
      );

      expect(result.id).toBe("p1");
      expect(db.update).toHaveBeenCalledWith(wines);
    });

    it("throws NOT_ENOUGH_STOCK if wine quantity is insufficient", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        for: vi.fn().mockResolvedValue([{ quantity: 2 }]),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as unknown as MockChained);

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
      vi.mocked(mockDb.select)
        .mockReturnValueOnce({
          for: vi.fn().mockResolvedValue([{ quantity: 10 }]),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        } as unknown as MockChained)
        .mockReturnValueOnce({
          for: vi.fn().mockResolvedValue([{ quantity: 20 }]),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        } as unknown as MockChained);

      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "b1", isBundle: true }]);

      const result = await productsRepository.createBundleWithWines(
        "s1",
        { name: "Bundle", price: "50", quantity: 2 },
        [
          { quantity: 1, wineId: "w1" },
          { quantity: 2, wineId: "w2" },
        ]
      );

      expect(result.id).toBe("b1");
      expect(db.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateProduct", () => {
    it("handles quantity change for the same wine", async () => {
      const mockProduct = {
        id: "p1",
        productWines: [{ wineId: "w1" }],
        quantity: 10,
      };
      vi.mocked(db.query.products.findFirst).mockResolvedValue(mockProduct as never);

      vi.mocked(mockDb.select).mockReturnValueOnce({
        for: vi.fn().mockResolvedValue([{ quantity: 100 }]),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as unknown as MockChained);

      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "p1", quantity: 15 }]);

      const result = await productsRepository.updateProduct("p1", { quantity: 15 });

      expect(result.id).toBe("p1");
      expect(db.update).toHaveBeenCalledWith(wines);
      expect(db.update).toHaveBeenCalledWith(products);
    });

    it("handles wine ID change", async () => {
      const mockProduct = {
        id: "p1",
        productWines: [{ wineId: "w1" }],
        quantity: 10,
      };
      vi.mocked(db.query.products.findFirst).mockResolvedValue(mockProduct as never);

      vi.mocked(mockDb.select).mockReturnValueOnce({
        for: vi.fn().mockResolvedValue([{ quantity: 100 }]),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as unknown as MockChained);

      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "p1" }]);

      await productsRepository.updateProduct("p1", { quantity: 10 }, "w2");

      expect(db.update).toHaveBeenCalledTimes(3);
    });
  });

  describe("softDelete", () => {
    it("reverts stock before soft deleting", async () => {
      const mockProduct = {
        id: "p1",
        productWines: [{ quantity: 1, wineId: "w1" }],
        quantity: 5,
      };
      vi.mocked(db.query.products.findFirst).mockResolvedValue(mockProduct as never);

      await productsRepository.softDelete("p1");

      expect(db.update).toHaveBeenCalledWith(wines);
      expect(db.update).toHaveBeenCalledWith(products);
    });
  });

  describe("findByIds", () => {
    it("returns empty array immediately when ids list is empty", async () => {
      const result = await productsRepository.findByIds([]);
      expect(result).toEqual([]);
      expect(db.query.products.findMany).not.toHaveBeenCalled();
    });

    it("calls findMany with inArray and soft-delete filter", async () => {
      const mockData = [
        {
          id: "p1",
          name: "Pinot Noir",
          productWines: [
            {
              wine: {
                color: "red",
                id: "w1",
                name: "Red Wine",
                region: "Bordeaux",
                type: "still",
                vintageYear: 2020,
                winemaker: { name: "Jean Dupont" },
              },
            },
          ],
        },
      ];
      vi.mocked(db.query.products.findMany).mockResolvedValue(mockData as never);

      const result = await productsRepository.findByIds(["p1"]);

      expect(db.query.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(), // includes and(inArray(...), isNull(deletedAt))
          with: expect.objectContaining({
            productWines: expect.anything(),
          }),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("findAll", () => {
    it("returns rows and total with correct shape", async () => {
      const mockRows = [
        {
          avgRating: "4.5",
          id: "p1",
          isBundle: false,
          name: "Château Noir",
          price: "12.99",
          quantity: 5,
          reviewCount: 3,
          shopId: "s1",
          shopName: "The Wine Shop",
        },
      ];

      // First db.select call: main paginated query (chain ends with .offset)
      const mainChain = {
        as: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockRows),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      // Second db.select call: count subquery base (chain ends with .as())
      const countSubqChain = {
        as: vi.fn().mockReturnValue({ _subq: true }),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      // Third db.select call: count outer query (chain ends with .from(subq))
      const countOuterChain = {
        from: vi.fn().mockResolvedValue([{ total: 1 }]),
      };

      vi.mocked(mockDb.select)
        .mockReturnValueOnce(mainChain as never)
        .mockReturnValueOnce(countSubqChain as never)
        .mockReturnValueOnce(countOuterChain as never);

      const result = await productsRepository.findAll({}, { limit: 20, offset: 0 });

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it("returns empty rows and zero total when nothing matches", async () => {
      const emptyMain = {
        as: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      const emptySubq = {
        as: vi.fn().mockReturnValue({ _subq: true }),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      const emptyCount = { from: vi.fn().mockResolvedValue([{ total: 0 }]) };

      vi.mocked(mockDb.select)
        .mockReturnValueOnce(emptyMain as never)
        .mockReturnValueOnce(emptySubq as never)
        .mockReturnValueOnce(emptyCount as never);

      const result = await productsRepository.findAll({}, { limit: 20, offset: 0 });

      expect(result.rows).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("applies having clause when rating filter is provided", async () => {
      const ratedMain = {
        as: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      const ratedSubq = {
        as: vi.fn().mockReturnValue({ _subq: true }),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      const ratedCount = { from: vi.fn().mockResolvedValue([{ total: 0 }]) };

      vi.mocked(mockDb.select)
        .mockReturnValueOnce(ratedMain as never)
        .mockReturnValueOnce(ratedSubq as never)
        .mockReturnValueOnce(ratedCount as never);

      const result = await productsRepository.findAll({ rating: 4 }, { limit: 20, offset: 0 });

      expect(ratedMain.having).toHaveBeenCalled();
      expect(ratedSubq.having).toHaveBeenCalled();
      expect(result.rows).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
