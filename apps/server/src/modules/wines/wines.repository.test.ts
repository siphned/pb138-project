import { wines } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as winesRepo from "./wines.repository";

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
    query: {
      winemakers: {
        findFirst: vi.fn(),
      },
      wines: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
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

      await winesRepo.findAll(db, { region: "Bordeaux", type: "still" });

      expect(db.query.wines.findMany).toHaveBeenCalled();
    });

    it("filters out deleted winemakers in-memory", async () => {
      const mockRows = [
        { id: "w1", winemaker: { deletedAt: null, id: "wm1" } },
        { id: "w2", winemaker: { deletedAt: new Date(), id: "wm2" } },
      ];
      vi.mocked(db.query.wines.findMany).mockResolvedValue(mockRows as never);

      const result = await winesRepo.findAll(db, {});

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("w1");
    });
  });

  describe("findById", () => {
    it("delegates to db.query and filters deleted winemaker", async () => {
      const mockWine = { id: "w1", winemaker: { deletedAt: null, id: "wm1" } };
      vi.mocked(db.query.wines.findFirst).mockResolvedValue(mockWine as never);
      const result = await winesRepo.findById(db, "w1");
      expect(result?.id).toBe("w1");
    });

    it("returns undefined if winemaker is deleted", async () => {
      const mockWine = { id: "w1", winemaker: { deletedAt: new Date(), id: "wm1" } };
      vi.mocked(db.query.wines.findFirst).mockResolvedValue(mockWine as never);
      const result = await winesRepo.findById(db, "w1");
      expect(result).toBeUndefined();
    });
  });

  describe("insert", () => {
    it("creates a wine", async () => {
      const mockWine = { id: "new-w" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockWine]);

      const result = await winesRepo.insert(db, "wm1", {
        alcoholContent: "13.5",
        attribution: "Attr",
        color: "red",
        composition: "Comp",
        description: "Desc",
        name: "Wine",
        quantity: 100,
        region: "Reg",
        type: "still",
        vintageYear: 2020,
        volumeMl: 750,
      });

      expect(result.id).toBe("new-w");
      expect(db.insert).toHaveBeenCalledWith(wines);
    });
  });

  describe("updateById", () => {
    it("updates wine record", async () => {
      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "w1" }]);

      await winesRepo.updateById(db, "w1", { name: "Updated" } as never);

      expect(db.update).toHaveBeenCalledWith(wines);
    });
  });

  describe("softDelete", () => {
    it("sets deletedAt for the record", async () => {
      await winesRepo.softDelete(db, "w1");
      expect(db.update).toHaveBeenCalledWith(wines);
    });
  });
});
