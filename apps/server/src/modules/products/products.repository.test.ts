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
  returning: () => Promise<unknown[]>;
  values: () => MockChained;
  onConflictDoUpdate: () => MockChained;
  set: () => MockChained;
  where: () => MockChained;
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
  query: {
    products: {
      findFirst: unknown;
      findMany: unknown;
    };
    wines: {
      findMany: unknown;
    };
  };
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
      wines: {
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
    });
  });

  describe("findByIds", () => {
    it("returns empty array immediately when ids list is empty", async () => {
      const result = await productsRepo.findByIds(db, []);
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

      const result = await productsRepo.findByIds(db, ["p1"]);

      expect(db.query.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
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

      const countSubqChain = {
        as: vi.fn().mockReturnValue({ _subq: true }),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      const countOuterChain = {
        from: vi.fn().mockResolvedValue([{ total: 1 }]),
      };

      vi.mocked(mockDb.select)
        .mockReturnValueOnce(mainChain as never)
        .mockReturnValueOnce(countSubqChain as never)
        .mockReturnValueOnce(countOuterChain as never);

      const result = await productsRepo.findAll(db, {}, { limit: 20, offset: 0 });

      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });
  });
});
