import { roleRequests } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
<<<<<<< HEAD
import * as roleRequestsRepository from "./role-requests.repository";

const mockDb = db as any;
=======
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
      findFirst: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;
>>>>>>> origin/main

vi.mock("../../db", () => {
  const m = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    query: {
      roleRequests: {
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

describe("roleRequestsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockRequest = { id: "r1" };
<<<<<<< HEAD
      vi.mocked(db.query.roleRequests.findFirst).mockResolvedValue(mockRequest as any);
      const result = await roleRequestsRepository.findById(db, "r1");
=======
      vi.mocked(db.query.roleRequests.findFirst).mockResolvedValue(mockRequest as never);
      const result = await roleRequestsRepository.findById("r1");
>>>>>>> origin/main
      expect(result).toBe(mockRequest);
    });
  });

  describe("create", () => {
    it("creates a role request", async () => {
<<<<<<< HEAD
      vi.mocked(mockDb.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "new-r" }]),
        }),
      });
      const result = await roleRequestsRepository.create(db, {
        businessName: "Biz",
        requestedRole: "winemaker",
        userId: "u1",
      } as any);

      expect(result.id).toBe("new-r");
=======
      const mockRequest = { id: "new-r" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRequest]);

      const result = await roleRequestsRepository.create({
        businessName: "Biz",
        requestedRole: "winemaker",
        userId: "u1",
      } as never);

      expect(result).toBe(mockRequest);
>>>>>>> origin/main
      expect(db.insert).toHaveBeenCalledWith(roleRequests);
    });
  });

  describe("updateStatus", () => {
    it("updates status and adminUserId", async () => {
<<<<<<< HEAD
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "r1", status: "approved" }]),
          }),
        }),
      });
      const result = await roleRequestsRepository.updateStatus(db, "r1", "approved", "admin1");

      expect(result?.status).toBe("approved");
=======
      const mockRequest = { id: "r1", status: "approved" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockRequest]);

      const result = await roleRequestsRepository.updateStatus("r1", "approved", "admin1");

      expect(result).toBe(mockRequest);
>>>>>>> origin/main
      expect(db.update).toHaveBeenCalledWith(roleRequests);
    });
  });
});
