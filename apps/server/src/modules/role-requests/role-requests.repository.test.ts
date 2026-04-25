import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { roleRequests } from "../../db/schema";
import { roleRequestsRepository } from "./role-requests.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
}

interface MockDatabase {
  insert: () => MockChained;
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
  query: {
    roleRequests: {
      findFirst: vi.Mock;
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
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    query: {
      roleRequests: {
        findFirst: vi.fn(),
      },
    },
  };
  return { db: m };
});

describe("roleRequestsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockRequest = { id: "r1" };
      vi.mocked(db.query.roleRequests.findFirst).mockResolvedValue(mockRequest as never);
      const result = await roleRequestsRepository.findById("r1");
      expect(result).toBe(mockRequest);
    });
  });

  describe("create", () => {
    it("creates a role request", async () => {
      const mockRequest = { id: "new-r" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRequest]);

      const result = await roleRequestsRepository.create({
        userId: "u1",
        requestedRole: "winemaker",
        businessName: "Biz",
      } as never);

      expect(result).toBe(mockRequest);
      expect(db.insert).toHaveBeenCalledWith(roleRequests);
    });
  });

  describe("updateStatus", () => {
    it("updates status and adminUserId", async () => {
      const mockRequest = { id: "r1", status: "approved" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRequest]);

      const result = await roleRequestsRepository.updateStatus("r1", "approved", "admin1");

      expect(result).toBe(mockRequest);
      expect(db.update).toHaveBeenCalledWith(roleRequests);
    });
  });
});
