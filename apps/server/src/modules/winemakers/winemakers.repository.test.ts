import { winemakers } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
<<<<<<< HEAD
import * as winemakersRepository from "./winemakers.repository";

const mockDb = db as any;
=======
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
>>>>>>> origin/main

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
<<<<<<< HEAD
      vi.mocked(db.query.winemakers.findMany).mockResolvedValue(mockList as any);
      const result = await winemakersRepository.findAll(db, {});
      expect(result).toStrictEqual(mockList);
    });

    it("accepts q filter for name search", async () => {
      vi.mocked(db.query.winemakers.findMany).mockResolvedValue([]);
      await winemakersRepository.findAll(db, { q: "chateau" });
      expect(db.query.winemakers.findMany).toHaveBeenCalled();
    });
=======
      vi.mocked(db.query.winemakers.findMany).mockResolvedValue(mockList as never);
      const result = await winemakersRepository.findAll();
      expect(result).toStrictEqual(mockList);
    });
>>>>>>> origin/main
  });

  describe("findById", () => {
    it("delegates to db.query.findFirst", async () => {
      const mockWinemaker = { address: { deletedAt: null, id: "a1" }, id: "wm1" };
<<<<<<< HEAD
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as any);
      const result = await winemakersRepository.findById(db, "wm1");
=======
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as never);
      const result = await winemakersRepository.findById("wm1");
>>>>>>> origin/main
      expect(result).toStrictEqual(mockWinemaker);
    });
  });

  describe("findByUserId", () => {
    it("delegates to db.query.findFirst", async () => {
      const mockWinemaker = { id: "wm1", userId: "u1" };
<<<<<<< HEAD
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as any);
      const result = await winemakersRepository.findByUserId(db, "u1");
=======
      vi.mocked(db.query.winemakers.findFirst).mockResolvedValue(mockWinemaker as never);
      const result = await winemakersRepository.findByUserId("u1");
>>>>>>> origin/main
      expect(result).toBe(mockWinemaker);
    });
  });

  describe("findWinesByWinemakerId", () => {
    it("delegates to db.query.wines.findMany", async () => {
      const mockWines = [{ id: "w1" }];
<<<<<<< HEAD
      vi.mocked(db.query.wines.findMany).mockResolvedValue(mockWines as any);
      const result = await winemakersRepository.findWinesByWinemakerId(db, "wm1");
=======
      vi.mocked(db.query.wines.findMany).mockResolvedValue(mockWines as never);
      const result = await winemakersRepository.findWinesByWinemakerId("wm1");
>>>>>>> origin/main
      expect(result).toBe(mockWines);
    });
  });

  describe("updateById", () => {
    it("updates winemaker and returns record", async () => {
<<<<<<< HEAD
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "wm1", name: "New Name" }]),
          }),
        }),
      });

      const result = await winemakersRepository.updateById(db, "wm1", { name: "New Name" });

      expect(result?.name).toBe("New Name");
=======
      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "wm1", name: "New Name" }]);

      const result = await winemakersRepository.updateById("wm1", { name: "New Name" });

      expect(result.name).toBe("New Name");
>>>>>>> origin/main
      expect(db.update).toHaveBeenCalledWith(winemakers);
    });

    it("throws if winemaker not found during update", async () => {
<<<<<<< HEAD
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(winemakersRepository.updateById(db, "wm1", { name: "X" })).rejects.toThrow(
=======
      vi.mocked(mockDb.returning).mockResolvedValueOnce([]);

      await expect(winemakersRepository.updateById("wm1", { name: "X" })).rejects.toThrow(
>>>>>>> origin/main
        "Winemaker not found"
      );
    });
  });
});
