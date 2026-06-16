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
    query: {
      shops: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    select: vi.fn(),
    set: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(m)),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

const mockDb = db as any;

describe("shopsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockShop = { address: { deletedAt: null, id: "a1" }, id: "s1" };
      vi.mocked(db.query.shops.findFirst).mockResolvedValue(mockShop as any);
      const result = await shopsRepository.findById(db, "s1");
      expect(result).toBe(mockShop);
    });
  });

  describe("findAllByOwnerUserId", () => {
    it("returns shops with their non-deleted address", async () => {
      const mockShops = [
        { address: { deletedAt: null, id: "a1" }, id: "s1" },
        { address: { deletedAt: null, id: "a2" }, id: "s2" },
      ];
      vi.mocked(db.query.shops.findMany).mockResolvedValue(mockShops as any);
      const result = await shopsRepository.findAllByOwnerUserId(db, "u1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("s1");
    });

    it("filters out shops whose address has been soft-deleted", async () => {
      const mockShops = [
        { address: { deletedAt: null, id: "a1" }, id: "s1" },
        { address: { deletedAt: new Date(), id: "a2" }, id: "s2" },
      ];
      vi.mocked(db.query.shops.findMany).mockResolvedValue(mockShops as any);
      const result = await shopsRepository.findAllByOwnerUserId(db, "u1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("s1");
    });
  });

  describe("findAll with filters", () => {
    const pagination = { limit: 24, offset: 0 };

    // findAll runs the row query and a COUNT query (db.select().from().where()) in
    // parallel. Stub the count chain to resolve to [{ total }].
    const stubCount = (total: number) => {
      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([{ total }]) }),
      });
    };

    it("accepts q filter", async () => {
      vi.mocked(db.query.shops.findMany).mockResolvedValue([]);
      stubCount(0);
      await shopsRepository.findAll(db, { q: "boutique" }, pagination);
      expect(db.query.shops.findMany).toHaveBeenCalled();
    });

    it("accepts ownerUserId filter", async () => {
      vi.mocked(db.query.shops.findMany).mockResolvedValue([]);
      stubCount(0);
      await shopsRepository.findAll(db, { ownerUserId: "u1" }, pagination);
      expect(db.query.shops.findMany).toHaveBeenCalled();
    });

    it("returns rows and total", async () => {
      const mockShops = [{ address: { deletedAt: null, id: "a1" }, id: "s1" }];
      vi.mocked(db.query.shops.findMany).mockResolvedValue(mockShops as any);
      stubCount(1);
      const result = await shopsRepository.findAll(db, {}, pagination);
      expect(result).toStrictEqual({ rows: mockShops, total: 1 });
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
      expect(db.insert).toHaveBeenCalledWith(shops);
    });
  });
});
