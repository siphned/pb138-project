import { availabilityExceptions, availabilityRegular } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as availabilityRepository from "./availability.repository";

interface MockChained {
  from: () => MockChained;
  returning: () => Promise<unknown[]>;
  where: () => MockChained;
}

interface MockDatabase {
  delete: () => MockChained;
  insert: () => MockChained;
  query: {
    availabilityExceptions: {
      findMany: unknown;
    };
    availabilityRegular: {
      findMany: unknown;
    };
  };
  returning: () => Promise<unknown[]>;
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    query: {
      availabilityExceptions: {
        findMany: vi.fn(),
      },
      availabilityRegular: {
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
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

      const result = await availabilityRepository.insertRegular(db, {
        dow: 1,
        endTime: new Date(),
        shopId: "s1",
        startTime: new Date(),
        type: "open",
        validFrom: "2024-01-01",
      } as never);

      expect(result).toBe(mockRecord);
      expect(db.insert).toHaveBeenCalledWith(availabilityRegular);
    });
  });

  describe("insertException", () => {
    it("inserts an exception availability record", async () => {
      const mockRecord = { id: "e1" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRecord]);

      const result = await availabilityRepository.insertException(db, {
        action: "close",
        endsAt: new Date(),
        shopId: "s1",
        startsAt: new Date(),
      } as never);

      expect(result).toBe(mockRecord);
      expect(db.insert).toHaveBeenCalledWith(availabilityExceptions);
    });
  });
});
