<<<<<<< HEAD
import { products, productWines, wines } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as productsRepo from "./products.repository";

interface MockChained {
  as: () => MockChained;
  for: () => Promise<unknown[]>;
  from: () => MockChained;
  groupBy: () => MockChained;
  having: () => MockChained;
  innerJoin: () => MockChained;
  leftJoin: () => MockChained;
  limit: () => MockChained;
  offset: () => MockChained;
  orderBy: () => MockChained;
=======
import { products, wines } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { productsRepository } from "./products.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  for: () => Promise<unknown[]>;
>>>>>>> origin/main
  returning: () => Promise<unknown[]>;
  values: () => MockChained;
  onConflictDoUpdate: () => MockChained;
  set: () => MockChained;
<<<<<<< HEAD
  where: () => MockChained;
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  query: {
    products: {
      findFirst: unknown;
      findMany: unknown;
    };
    wines: {
      findMany: unknown;
    };
  };
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
      wines: {
        findMany: vi.fn(),
      },
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
  describe("create", () => {
    it("inserts product and returns it", async () => {
      const mockProduct = { id: "p1", name: "Wine" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockProduct]);

      const result = await productsRepo.create(db, { name: "Wine" } as any);

      expect(db.insert).toHaveBeenCalledWith(products);
      expect(result).toEqual(mockProduct);
    });
  });

  describe("createProductWines", () => {
    it("inserts product-wine associations", async () => {
      await productsRepo.createProductWines(db, [{ productId: "p1", quantity: 1, wineId: "w1" }]);
      expect(db.insert).toHaveBeenCalledWith(productWines);
    });

    it("does nothing if data is empty", async () => {
      await productsRepo.createProductWines(db, []);
      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe("deleteProductWines", () => {
    it("deletes associations for a product", async () => {
      await productsRepo.deleteProductWines(db, "p1");
      expect(db.delete).toHaveBeenCalledWith(productWines);
    });
  });

  describe("update", () => {
    it("updates product and returns updated row", async () => {
      const mockUpdated = { id: "p1", name: "New Name" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockUpdated]);

      const result = await productsRepo.update(db, "p1", { name: "New Name" });

      expect(db.update).toHaveBeenCalledWith(products);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("getWineQuantityForUpdate", () => {
    it("returns quantity for given wine", async () => {
      vi.mocked(mockDb.select).mockReturnValueOnce({
        for: vi.fn().mockResolvedValueOnce([{ quantity: 50 }]),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as any);

      const qty = await productsRepo.getWineQuantityForUpdate(db, "w1");
      expect(qty).toBe(50);
    });
  });

  describe("updateWineQuantity", () => {
    it("updates wine quantity in db", async () => {
      await productsRepo.updateWineQuantity(db, "w1", 10);
      expect(db.update).toHaveBeenCalledWith(wines);
    });
  });

  describe("winesExist", () => {
    it("returns true if all wines found", async () => {
      vi.mocked(db.query.wines.findMany).mockResolvedValue([{ id: "w1" }, { id: "w2" }] as never);
      const exists = await productsRepo.winesExist(db, ["w1", "w2"]);
      expect(exists).toBe(true);
    });

    it("returns false if some wines missing", async () => {
      vi.mocked(db.query.wines.findMany).mockResolvedValue([{ id: "w1" }] as never);
      const exists = await productsRepo.winesExist(db, ["w1", "w2"]);
      expect(exists).toBe(false);
=======
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
>>>>>>> origin/main
    });
  });

  describe("findByIds", () => {
    it("returns empty array immediately when ids list is empty", async () => {
<<<<<<< HEAD
      const result = await productsRepo.findByIds(db, []);
=======
      const result = await productsRepository.findByIds([]);
>>>>>>> origin/main
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

<<<<<<< HEAD
      const result = await productsRepo.findByIds(db, ["p1"]);

      expect(db.query.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
=======
      const result = await productsRepository.findByIds(["p1"]);

      expect(db.query.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(), // includes and(inArray(...), isNull(deletedAt))
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
      // First db.select call: main paginated query (chain ends with .offset)
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
      // Second db.select call: count subquery base (chain ends with .as())
>>>>>>> origin/main
      const countSubqChain = {
        as: vi.fn().mockReturnValue({ _subq: true }),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

<<<<<<< HEAD
=======
      // Third db.select call: count outer query (chain ends with .from(subq))
>>>>>>> origin/main
      const countOuterChain = {
        from: vi.fn().mockResolvedValue([{ total: 1 }]),
      };

      vi.mocked(mockDb.select)
        .mockReturnValueOnce(mainChain as never)
        .mockReturnValueOnce(countSubqChain as never)
        .mockReturnValueOnce(countOuterChain as never);

<<<<<<< HEAD
      const result = await productsRepo.findAll(db, {}, { limit: 20, offset: 0 });
=======
      const result = await productsRepository.findAll({}, { limit: 20, offset: 0 });
>>>>>>> origin/main

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

<<<<<<< HEAD
    function makeChains(mockRows: unknown[]) {
      const mainChain = {
=======
    it("returns empty rows and zero total when nothing matches", async () => {
      const emptyMain = {
>>>>>>> origin/main
        as: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
<<<<<<< HEAD
        offset: vi.fn().mockResolvedValue(mockRows),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      const countSubqChain = {
=======
        offset: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      const emptySubq = {
>>>>>>> origin/main
        as: vi.fn().mockReturnValue({ _subq: true }),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
<<<<<<< HEAD
      const countOuterChain = {
        from: vi.fn().mockResolvedValue([{ total: 1 }]),
      };
      vi.mocked(mockDb.select)
        .mockReturnValueOnce(mainChain as never)
        .mockReturnValueOnce(countSubqChain as never)
        .mockReturnValueOnce(countOuterChain as never);
      return mockRows;
    }

    it("accepts q filter without throwing", async () => {
      const mockRows = [
        {
          avgRating: null,
          id: "p1",
          isBundle: false,
          name: "Pinot",
          price: "12.99",
          quantity: 5,
          reviewCount: 0,
          shopId: "s1",
          shopName: "Shop",
        },
      ];
      makeChains(mockRows);

      const result = await productsRepo.findAll(db, { q: "pinot" }, { limit: 20, offset: 0 });

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it("accepts shopId filter without throwing", async () => {
      const mockRows: unknown[] = [];
      makeChains(mockRows);

      const result = await productsRepo.findAll(db, { shopId: "s1" }, { limit: 20, offset: 0 });

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it("accepts isBundle filter without throwing", async () => {
      const mockRows: unknown[] = [];
      makeChains(mockRows);

      const result = await productsRepo.findAll(db, { isBundle: true }, { limit: 20, offset: 0 });

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it("accepts containsProductId filter without throwing", async () => {
      const mockRows: unknown[] = [];
      makeChains(mockRows);

      const result = await productsRepo.findAll(
        db,
        { containsProductId: "p1" },
        { limit: 20, offset: 0 }
      );

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
=======
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
>>>>>>> origin/main
    });
  });
});
