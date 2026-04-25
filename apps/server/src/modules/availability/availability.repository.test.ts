import { beforeEach, describe, expect, it, vi } from "vitest";
import { availabilityRepository } from "./availability.repository";
import { db } from "../../db";
import { availabilityExceptions, availabilityRegular } from "../../db/schema";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
}

interface MockDatabase {
  insert: () => MockChained;
  delete: () => MockChained;
  returning: () => Promise<unknown[]>;
  query: {
    availabilityRegular: {
      findMany: vi.Mock;
    };
    availabilityExceptions: {
      findMany: vi.Mock;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    query: {
      availabilityRegular: {
        findMany: vi.fn(),
      },
      availabilityExceptions: {
        findMany: vi.fn(),
      },
    },
  };
  return { db: m };
});

describe("availabilityRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("insertRegular", () => {
    it("inserts a regular availability record", async () => {
      const mockRecord = { id: "r1" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRecord]);

      const result = await availabilityRepository.insertRegular({
        shopId: "s1",
        dow: 1,
        startTime: new Date(),
        endTime: new Date(),
        validFrom: "2024-01-01",
        type: "open",
      } as never);

      expect(result).toBe(mockRecord);
      expect(db.insert).toHaveBeenCalledWith(availabilityRegular);
    });
  });

  describe("insertException", () => {
    it("inserts an exception availability record", async () => {
      const mockRecord = { id: "e1" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRecord]);

      const result = await availabilityRepository.insertException({
        shopId: "s1",
        startsAt: new Date(),
        endsAt: new Date(),
        action: "close",
      } as never);

      expect(result).toBe(mockRecord);
      expect(db.insert).toHaveBeenCalledWith(availabilityExceptions);
    });
  });
});
