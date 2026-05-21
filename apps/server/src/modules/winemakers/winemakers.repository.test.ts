import { winemakers } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as winemakersRepository from "./winemakers.repository";

const mockDb = db as any;

vi.mock("../../db", () => {
  const m = {
    query: {
      events: {
        findMany: vi.fn(),
      },
      winemakers: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      wines: {
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("winemakersRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("delegates to db.query.findMany", async () => {
      const mockList = [{ address: { deletedAt: null, id: "a1" }, id: "wm1" }];
      vi.mocked(db.query.winemakers.findMany).mockResolvedValue(mockList as any);
      const result = await winemakersRepository.findAll(db, {});
      expect(result).toStrictEqual(mockList);
    });

    it("accepts q filter for name search", async () => {
      vi.mocked(db.query.winemakers.findMany).mockResolvedValue([]);
      await winemakersRepository.findAll(db, { q: "chateau" });
      expect(db.query.winemakers.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("delegates to db.query.findFirst", async () => {
      const mockWinemaker = { address: { deletedAt: null, id: "a1" }, id: "wm1" };
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as any);
      const result = await winemakersRepository.findById(db, "wm1");
      expect(result).toStrictEqual(mockWinemaker);
    });
  });

  describe("findByUserId", () => {
    it("delegates to db.query.findFirst", async () => {
      const mockWinemaker = { id: "wm1", userId: "u1" };
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as any);
      const result = await winemakersRepository.findByUserId(db, "u1");
      expect(result).toBe(mockWinemaker);
    });
  });

  describe("findWinesByWinemakerId", () => {
    it("delegates to db.query.wines.findMany", async () => {
      const mockWines = [{ id: "w1" }];
      vi.mocked(db.query.wines.findMany).mockResolvedValue(mockWines as any);
      const result = await winemakersRepository.findWinesByWinemakerId(db, "wm1");
      expect(result).toBe(mockWines);
    });
  });

  describe("updateById", () => {
    it("updates winemaker and returns record", async () => {
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "wm1", name: "New Name" }]),
          }),
        }),
      });

      const result = await winemakersRepository.updateById(db, "wm1", { name: "New Name" });

      expect(result?.name).toBe("New Name");
      expect(db.update).toHaveBeenCalledWith(winemakers);
    });

    it("throws if winemaker not found during update", async () => {
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(winemakersRepository.updateById(db, "wm1", { name: "X" })).rejects.toThrow(
        "Winemaker not found"
      );
    });
  });
});
