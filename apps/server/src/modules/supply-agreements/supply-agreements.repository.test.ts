import { supplyAgreements } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as supplyAgreementsRepository from "./supply-agreements.repository";

vi.mock("../../db", () => {
  const m = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    query: {
      supplyAgreements: {
        findFirst: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

const mockDb = db as any;

describe("supplyAgreementsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockAgreement = { id: "a1" };
      vi.mocked(db.query.supplyAgreements.findFirst).mockResolvedValue(mockAgreement as any);
      const result = await supplyAgreementsRepository.findById(db, "a1");
      expect(result).toBe(mockAgreement);
    });
  });

  describe("create", () => {
    it("creates an agreement", async () => {
      vi.mocked(mockDb.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "new-a" }]),
        }),
      });
      const result = await supplyAgreementsRepository.create(db, {
        shopId: "s1",
        winemakerId: "w1",
      });
      expect(result.id).toBe("new-a");
      expect(db.insert).toHaveBeenCalledWith(supplyAgreements);
    });
  });

  describe("listApprovedWinemakerIdsForShop", () => {
    it("selects approved agreements for the shop and returns winemaker IDs", async () => {
      const where = vi.fn().mockResolvedValue([{ winemakerId: "wm1" }, { winemakerId: "wm2" }]);
      const from = vi.fn().mockReturnValue({ where });
      vi.mocked(mockDb.select).mockReturnValue({ from });

      const result = await supplyAgreementsRepository.listApprovedWinemakerIdsForShop(db, "s1");

      expect(result).toEqual(["wm1", "wm2"]);
      expect(from).toHaveBeenCalledWith(supplyAgreements);
    });
  });

  describe("updateStatus", () => {
    it("updates status and respondedAt", async () => {
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "a1", status: "approved" }]),
          }),
        }),
      });
      const result = await supplyAgreementsRepository.updateStatus(db, "a1", "approved");
      expect(result?.status).toBe("approved");
      expect(db.update).toHaveBeenCalledWith(supplyAgreements);
    });
  });
});
