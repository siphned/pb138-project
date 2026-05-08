import { roleRequests } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as roleRequestsRepository from "./role-requests.repository";

const mockDb = db as any;

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
      vi.mocked(db.query.roleRequests.findFirst).mockResolvedValue(mockRequest as any);
      const result = await roleRequestsRepository.findById(db, "r1");
      expect(result).toBe(mockRequest);
    });
  });

  describe("create", () => {
    it("creates a role request", async () => {
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
      expect(db.insert).toHaveBeenCalledWith(roleRequests);
    });
  });

  describe("updateStatus", () => {
    it("updates status and adminUserId", async () => {
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "r1", status: "approved" }]),
          }),
        }),
      });
      const result = await roleRequestsRepository.updateStatus(db, "r1", "approved", "admin1");

      expect(result?.status).toBe("approved");
      expect(db.update).toHaveBeenCalledWith(roleRequests);
    });
  });
});
