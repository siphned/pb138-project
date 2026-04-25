import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { wines } from "../../db/schema";
import { winesRepository } from "./wines.repository";

interface MockChained {
  returning: () => Promise<unknown[]>;
  set: () => MockChained;
  where: () => MockChained;
}

interface MockDatabase {
  insert: () => MockChained;
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
  query: {
    wines: {
      findFirst: unknown;
      findMany: unknown;
    };
    winemakers: {
      findFirst: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    query: {
      wines: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      winemakers: {
        findFirst: vi.fn(),
      },
    },
  };
  return { db: m };
});

describe("winesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("applies filters correctly", async () => {
      vi.mocked(db.query.wines.findMany).mockResolvedValue([]);

      await winesRepository.findAll({ region: "Bordeaux", type: "still" });

      expect(db.query.wines.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockWine = { id: "w1" };
      vi.mocked(db.query.wines.findFirst).mockResolvedValue(mockWine as never);
      const result = await winesRepository.findById("w1");
      expect(result).toBe(mockWine);
    });
  });

  describe("insert", () => {
    it("creates a wine", async () => {
      const mockWine = { id: "new-w" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockWine]);

      const result = await winesRepository.insert("wm1", {
        name: "Wine",
        description: "Desc",
        composition: "Comp",
        attribution: "Attr",
        region: "Reg",
        vintageYear: 2020,
        type: "still",
        color: "red",
        alcoholContent: "13.5",
        volumeMl: 750,
        quantity: 100,
      });

      expect(result.id).toBe("new-w");
      expect(db.insert).toHaveBeenCalledWith(wines);
    });
  });

  describe("updateById", () => {
    it("updates wine record", async () => {
      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "w1" }]);

      await winesRepository.updateById("w1", { name: "Updated" } as never);

      expect(db.update).toHaveBeenCalledWith(wines);
    });
  });

  describe("softDelete", () => {
    it("sets deletedAt for the record", async () => {
      await winesRepository.softDelete("w1");
      expect(db.update).toHaveBeenCalledWith(wines);
    });
  });
});
