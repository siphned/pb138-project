import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as adminRepo from "./admin.repository";

// ── Hoisted mock references for chainable methods ──────────────
const {
  mockQueryReviewsFindMany,
  mockQueryReviewsFindFirst,
  mockQueryUsersFindFirst,
  mockQueryUsersFindMany,
  mockSelectWhere,
  mockUpdateSetWhere,
  mockUpdateWhereReturning,
} = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const mockUpdateSetWhere = vi.fn();
  const mockUpdateWhereReturning = vi.fn();

  return {
    mockQueryReviewsFindFirst: vi.fn(),
    mockQueryReviewsFindMany: vi.fn(),
    mockQueryUsersFindFirst: vi.fn(),
    mockQueryUsersFindMany: vi.fn(),
    mockSelectWhere: selectWhere,
    mockUpdateSetWhere,
    mockUpdateWhereReturning,
  };
});

// Create a thenable with a .returning() method for update().where() chains
function createUpdateWhereResult(): any {
  const result: any = vi.fn().mockResolvedValue(undefined);
  result.returning = mockUpdateWhereReturning;
  return result;
}

vi.mock("../../db", () => ({
  db: {
    query: {
      reviews: {
        findFirst: mockQueryReviewsFindFirst,
        findMany: mockQueryReviewsFindMany,
      },
      users: {
        findFirst: mockQueryUsersFindFirst,
        findMany: mockQueryUsersFindMany,
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: mockSelectWhere,
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: mockUpdateSetWhere.mockReturnValue({
        where: vi.fn().mockReturnValue(createUpdateWhereResult()),
      }),
    }),
  },
}));

describe("adminRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default resolves — DO NOT override mockUpdateSetWhere's factory-set
    // return value, or .set(...) returns undefined and .where() breaks.
    mockSelectWhere.mockResolvedValue([{ value: 0 }]);
    mockUpdateWhereReturning.mockResolvedValue([]);
  });

  // ── findReviewById ───────────────────────────────────────────

  describe("findReviewById", () => {
    it("returns review when found", async () => {
      const mockReview = { comment: "Great!", id: "r1", rating: 5 };
      mockQueryReviewsFindFirst.mockResolvedValue(mockReview);

      const result = await adminRepo.findReviewById(db, "r1");

      expect(result).toEqual(mockReview);
    });

    it("returns undefined when not found", async () => {
      mockQueryReviewsFindFirst.mockResolvedValue(undefined);

      const result = await adminRepo.findReviewById(db, "nonexistent");

      expect(result).toBeUndefined();
    });
  });

  // ── findUserById ─────────────────────────────────────────────

  describe("findUserById", () => {
    it("returns user with roles when found", async () => {
      const mockUser = {
        id: "u1",
        name: "Test User",
        roles: [{ id: "ur1", role: "customer" }],
      };
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      const result = await adminRepo.findUserById(db, "u1");

      expect(result).toEqual(mockUser);
    });

    it("returns undefined when not found", async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      const result = await adminRepo.findUserById(db, "nonexistent");

      expect(result).toBeUndefined();
    });
  });

  // ── listAllReviews ───────────────────────────────────────────

  describe("listAllReviews", () => {
    it("returns paginated reviews with total count", async () => {
      const mockReviews = [
        { id: "r1", rating: 5, user: { fname: "John", id: "u1", lname: "Doe" } },
        { id: "r2", rating: 3, user: null },
      ];
      mockQueryReviewsFindMany.mockResolvedValue(mockReviews);
      mockSelectWhere.mockResolvedValue([{ value: 2 }]);

      const result = await adminRepo.listAllReviews(db, { limit: 10, offset: 0 });

      expect(result.data).toEqual(mockReviews);
      expect(result.total).toBe(2);
    });

    it("returns zero total when no reviews", async () => {
      mockQueryReviewsFindMany.mockResolvedValue([]);
      mockSelectWhere.mockResolvedValue([{ value: 0 }]);

      const result = await adminRepo.listAllReviews(db, { limit: 10, offset: 0 });

      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });

    it("handles missing count result gracefully", async () => {
      mockQueryReviewsFindMany.mockResolvedValue([]);
      mockSelectWhere.mockResolvedValue([]);

      const result = await adminRepo.listAllReviews(db, { limit: 10, offset: 0 });

      expect(result.total).toBe(0);
    });
  });

  // ── listUsers ────────────────────────────────────────────────

  describe("listUsers", () => {
    it("returns paginated users with optional status filter", async () => {
      const mockUsers = [{ id: "u1", name: "User 1", roles: [{ id: "ur1", role: "customer" }] }];
      mockQueryUsersFindMany.mockResolvedValue(mockUsers);
      mockSelectWhere.mockResolvedValue([{ value: 1 }]);

      const result = await adminRepo.listUsers(db, { status: "active" }, { limit: 10, offset: 0 });

      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
    });

    it("returns users without status filter when status is undefined", async () => {
      mockQueryUsersFindMany.mockResolvedValue([]);
      mockSelectWhere.mockResolvedValue([{ value: 0 }]);

      const result = await adminRepo.listUsers(db, {}, { limit: 10, offset: 0 });

      expect(result.total).toBe(0);
    });
  });

  // ── setUserStatus ────────────────────────────────────────────

  describe("setUserStatus", () => {
    it("updates user status and returns updated user", async () => {
      const updatedUser = { id: "u1", status: "suspended" };
      mockUpdateWhereReturning.mockResolvedValue([updatedUser]);

      const result = await adminRepo.setUserStatus(db, "u1", "suspended");

      expect(result).toEqual(updatedUser);
      expect(db.update).toHaveBeenCalled();
      expect(mockUpdateSetWhere).toHaveBeenCalledWith(
        expect.objectContaining({ status: "suspended" })
      );
    });

    it("throws when user is not found", async () => {
      mockUpdateWhereReturning.mockResolvedValue([]);

      await expect(adminRepo.setUserStatus(db, "u1", "active")).rejects.toThrow("User not found");
    });
  });

  // ── softDeleteReview ─────────────────────────────────────────

  describe("softDeleteReview", () => {
    it("sets deletedAt for the review", async () => {
      await adminRepo.softDeleteReview(db, "r1");

      expect(db.update).toHaveBeenCalled();
      expect(mockUpdateSetWhere).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) })
      );
    });
  });
});
