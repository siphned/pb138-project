import { supplyAgreements } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { supplyAgreementsRepository } from "./supply-agreements.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
  set: () => MockChained;
}

interface MockDatabase {
  insert: () => MockChained;
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
}

const mockDb = db as unknown as MockDatabase;

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

describe("supplyAgreementsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockAgreement = { id: "a1" };
      vi.mocked(db.query.supplyAgreements.findFirst).mockResolvedValue(mockAgreement as never);
      const result = await supplyAgreementsRepository.findById("a1");
      expect(result).toBe(mockAgreement);
    });
  });

  describe("create", () => {
    it("creates an agreement", async () => {
      const mockAgreement = { id: "new-a" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockAgreement]);

      const result = await supplyAgreementsRepository.create({ shopId: "s1", winemakerId: "w1" });

      expect(result).toBe(mockAgreement);
      expect(db.insert).toHaveBeenCalledWith(supplyAgreements);
    });
  });

  describe("updateStatus", () => {
    it("updates status and respondedAt", async () => {
      const mockAgreement = { id: "a1", status: "approved" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockAgreement]);

      const result = await supplyAgreementsRepository.updateStatus("a1", "approved");

      expect(result).toBe(mockAgreement);
      expect(db.update).toHaveBeenCalledWith(supplyAgreements);
    });
  });
});
