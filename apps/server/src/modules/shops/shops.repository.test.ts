import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { addresses, shops } from "../../db/schema";
import { shopsRepository } from "./shops.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
}

interface MockDatabase {
  insert: () => MockChained;
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
  query: {
    shops: {
      findFirst: unknown;
      findMany: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    query: {
      shops: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(m)),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("shopsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockShop = { id: "s1" };
      vi.mocked(db.query.shops.findFirst).mockResolvedValue(mockShop as never);
      const result = await shopsRepository.findById("s1");
      expect(result).toBe(mockShop);
    });
  });

  describe("findAllByOwnerUserId", () => {
    it("delegates to db.query.findMany", async () => {
      const mockShops = [{ id: "s1" }];
      vi.mocked(db.query.shops.findMany).mockResolvedValue(mockShops as never);
      const result = await shopsRepository.findAllByOwnerUserId("u1");
      expect(result).toBe(mockShops);
    });
  });

  describe("createShopWithAddress", () => {
    it("creates address and shop in a transaction", async () => {
      vi.mocked(mockDb.returning)
        .mockResolvedValueOnce([{ id: "a1" }]) // address
        .mockResolvedValueOnce([{ id: "s1" }]); // shop

      const result = await shopsRepository.createShopWithAddress(
        { description: "Desc", name: "Shop", ownerUserId: "u1" },
        { city: "B", country: "CZ", houseNumber: "1", postalCode: "1", street: "S" }
      );

      expect(result.id).toBe("s1");
      expect(db.transaction).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalledWith(addresses);
      expect(db.insert).toHaveBeenCalledWith(shops);
    });
  });
});
