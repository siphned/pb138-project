<<<<<<< HEAD
import { shops } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as shopsRepository from "./shops.repository";

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "a1" }]),
      }),
    }),
=======
import { addresses, shops } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
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
>>>>>>> origin/main
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

<<<<<<< HEAD
const mockDb = db as any;

=======
>>>>>>> origin/main
describe("shopsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockShop = { address: { deletedAt: null, id: "a1" }, id: "s1" };
<<<<<<< HEAD
      vi.mocked(db.query.shops.findFirst).mockResolvedValue(mockShop as any);
      const result = await shopsRepository.findById(db, "s1");
=======
      vi.mocked(db.query.shops.findFirst).mockResolvedValue(mockShop as never);
      const result = await shopsRepository.findById("s1");
>>>>>>> origin/main
      expect(result).toBe(mockShop);
    });
  });

  describe("findAllByOwnerUserId", () => {
    it("delegates to db.query.findMany", async () => {
      const mockShops = [{ id: "s1" }];
<<<<<<< HEAD
      vi.mocked(db.query.shops.findMany).mockResolvedValue(mockShops as any);
      const result = await shopsRepository.findAllByOwnerUserId(db, "u1");
=======
      vi.mocked(db.query.shops.findMany).mockResolvedValue(mockShops as never);
      const result = await shopsRepository.findAllByOwnerUserId("u1");
>>>>>>> origin/main
      expect(result).toBe(mockShops);
    });
  });

<<<<<<< HEAD
  describe("findAll with filters", () => {
    it("accepts q filter", async () => {
      vi.mocked(db.query.shops.findMany).mockResolvedValue([]);
      await shopsRepository.findAll(db, { q: "boutique" });
      expect(db.query.shops.findMany).toHaveBeenCalled();
    });

    it("accepts ownerUserId filter", async () => {
      vi.mocked(db.query.shops.findMany).mockResolvedValue([]);
      await shopsRepository.findAll(db, { ownerUserId: "u1" });
      expect(db.query.shops.findMany).toHaveBeenCalled();
    });
  });

  describe("createShop", () => {
    it("inserts shop and returns it", async () => {
      vi.mocked(mockDb.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "s1" }]),
        }),
      });
      const result = await shopsRepository.createShop(db, {
        addressId: "a1",
        description: "D",
        name: "S",
        ownerUserId: "u1",
      });
      expect(result.id).toBe("s1");
=======
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
>>>>>>> origin/main
      expect(db.insert).toHaveBeenCalledWith(shops);
    });
  });
});
