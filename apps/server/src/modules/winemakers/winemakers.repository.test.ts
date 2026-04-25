import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { winemakers } from "../../db/schema";
import { winemakersRepository } from "./winemakers.repository";

interface MockChained {
  returning: () => Promise<unknown[]>;
  set: () => MockChained;
  where: () => MockChained;
}

interface MockDatabase {
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
  query: {
    winemakers: {
      findFirst: unknown;
      findMany: unknown;
    };
    wines: {
      findMany: unknown;
    };
    events: {
      findMany: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    query: {
      winemakers: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      wines: {
        findMany: vi.fn(),
      },
      events: {
        findMany: vi.fn(),
      },
    },
  };
  return { db: m };
});

describe("winemakersRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("delegates to db.query.findMany", async () => {
      const mockList = [{ id: "wm1" }];
      vi.mocked(db.query.winemakers.findMany).mockResolvedValue(mockList as never);
      const result = await winemakersRepository.findAll();
      expect(result).toBe(mockList);
    });
  });

  describe("findById", () => {
    it("delegates to db.query.findFirst", async () => {
      const mockWinemaker = { id: "wm1" };
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as never);
      const result = await winemakersRepository.findById("wm1");
      expect(result).toBe(mockWinemaker);
    });
  });

  describe("findByUserId", () => {
    it("delegates to db.query.findFirst", async () => {
      const mockWinemaker = { id: "wm1", userId: "u1" };
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as never);
      const result = await winemakersRepository.findByUserId("u1");
      expect(result).toBe(mockWinemaker);
    });
  });

  describe("findWinesByWinemakerId", () => {
    it("delegates to db.query.wines.findMany", async () => {
      const mockWines = [{ id: "w1" }];
      vi.mocked(db.query.wines.findMany).mockResolvedValue(mockWines as never);
      const result = await winemakersRepository.findWinesByWinemakerId("wm1");
      expect(result).toBe(mockWines);
    });
  });

  describe("updateById", () => {
    it("updates winemaker and returns record", async () => {
      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "wm1", name: "New Name" }]);

      const result = await winemakersRepository.updateById("wm1", { name: "New Name" });

      expect(result.name).toBe("New Name");
      expect(db.update).toHaveBeenCalledWith(winemakers);
    });

    it("throws if winemaker not found during update", async () => {
      vi.mocked(mockDb.returning).mockResolvedValueOnce([]);

      await expect(winemakersRepository.updateById("wm1", { name: "X" })).rejects.toThrow(
        "Winemaker not found"
      );
    });
  });
});
