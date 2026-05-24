import { supplyAgreements } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
<<<<<<< HEAD
import * as supplyAgreementsRepository from "./supply-agreements.repository";
=======
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
>>>>>>> origin/main

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

<<<<<<< HEAD
const mockDb = db as any;

=======
>>>>>>> origin/main
describe("supplyAgreementsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockAgreement = { id: "a1" };
<<<<<<< HEAD
      vi.mocked(db.query.supplyAgreements.findFirst).mockResolvedValue(mockAgreement as any);
      const result = await supplyAgreementsRepository.findById(db, "a1");
=======
      vi.mocked(db.query.supplyAgreements.findFirst).mockResolvedValue(mockAgreement as never);
      const result = await supplyAgreementsRepository.findById("a1");
>>>>>>> origin/main
      expect(result).toBe(mockAgreement);
    });
  });

  describe("create", () => {
    it("creates an agreement", async () => {
<<<<<<< HEAD
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
=======
      const mockAgreement = { id: "new-a" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockAgreement]);

      const result = await supplyAgreementsRepository.create({ shopId: "s1", winemakerId: "w1" });

      expect(result).toBe(mockAgreement);
>>>>>>> origin/main
      expect(db.insert).toHaveBeenCalledWith(supplyAgreements);
    });
  });

  describe("updateStatus", () => {
    it("updates status and respondedAt", async () => {
<<<<<<< HEAD
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "a1", status: "approved" }]),
          }),
        }),
      });
      const result = await supplyAgreementsRepository.updateStatus(db, "a1", "approved");
      expect(result?.status).toBe("approved");
=======
      const mockAgreement = { id: "a1", status: "approved" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockAgreement]);

      const result = await supplyAgreementsRepository.updateStatus("a1", "approved");

      expect(result).toBe(mockAgreement);
>>>>>>> origin/main
      expect(db.update).toHaveBeenCalledWith(supplyAgreements);
    });
  });
});
