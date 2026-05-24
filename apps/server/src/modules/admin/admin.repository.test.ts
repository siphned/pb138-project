import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as adminRepo from "./admin.repository";

// ── Hoisted mock references for chainable methods ──────────────
const {
  mockQueryReviewsFindMany,
  mockQueryReviewsFindFirst,
  mockQueryEventsFindFirst,
  mockQueryEventsFindMany,
  mockQueryUsersFindFirst,
  mockQueryUsersFindMany,
  mockSelectWhere,
  mockSelectGroupBy,
  mockSelectFromInnerJoinWhere,
  mockUpdateSetWhere,
  mockUpdateWhereReturning,
} = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectGroupBy = vi.fn();
  const selectFromInnerJoinWhere = vi.fn();
  const mockUpdateSetWhere = vi.fn();
  const mockUpdateWhereReturning = vi.fn();

  return {
    mockQueryEventsFindFirst: vi.fn(),
    mockQueryEventsFindMany: vi.fn(),
    mockQueryReviewsFindFirst: vi.fn(),
    mockQueryReviewsFindMany: vi.fn(),
    mockQueryUsersFindFirst: vi.fn(),
    mockQueryUsersFindMany: vi.fn(),
    mockSelectFromInnerJoinWhere: selectFromInnerJoinWhere,
    mockSelectGroupBy: selectGroupBy,
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
      events: {
        findFirst: mockQueryEventsFindFirst,
        findMany: mockQueryEventsFindMany,
      },
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
        groupBy: mockSelectGroupBy,
        innerJoin: vi.fn().mockReturnValue({
          where: mockSelectFromInnerJoinWhere,
        }),
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

  // ── findEventById ────────────────────────────────────────────

  describe("findEventById", () => {
    it("returns event when found", async () => {
      const mockEvent = { id: "e1", name: "Wine Fest", status: "pending" };
      mockQueryEventsFindFirst.mockResolvedValue(mockEvent);

      const result = await adminRepo.findEventById(db, "e1");

      expect(result).toEqual(mockEvent);
      expect(mockQueryEventsFindFirst).toHaveBeenCalled();
    });

    it("returns undefined when not found", async () => {
      mockQueryEventsFindFirst.mockResolvedValue(undefined);

      const result = await adminRepo.findEventById(db, "nonexistent");

      expect(result).toBeUndefined();
    });
  });

  // ── findEventWithDetailsById ─────────────────────────────────

  describe("findEventWithDetailsById", () => {
    it("returns event with address and winemaker", async () => {
      const mockEventWithDetails = {
        address: {
          city: "Brno",
          country: "CZ",
          houseNumber: "1",
          postalCode: "60200",
          street: "Main",
        },
        id: "e1",
        name: "Wine Fest",
        status: "pending",
        winemaker: { id: "wm1", name: "Winery Inc" },
      };
      mockQueryEventsFindFirst.mockResolvedValue(mockEventWithDetails);

      const result = await adminRepo.findEventWithDetailsById(db, "e1");

      expect(result).toEqual(mockEventWithDetails);
    });

    it("returns undefined when event not found", async () => {
      mockQueryEventsFindFirst.mockResolvedValue(undefined);

      const result = await adminRepo.findEventWithDetailsById(db, "nonexistent");

      expect(result).toBeUndefined();
    });
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

  // ── listEvents ───────────────────────────────────────────────

  describe("listEvents", () => {
    it("returns filtered events by status", async () => {
      const mockEvents = [
        {
          address: {
            city: "Brno",
            country: "CZ",
            houseNumber: "1",
            postalCode: "60200",
            street: "Main",
          },
          id: "e1",
          name: "Wine Fest",
          status: "pending",
          winemaker: { id: "wm1", name: "Winery Inc" },
        },
      ];
      mockQueryEventsFindMany.mockResolvedValue(mockEvents);
      mockSelectWhere.mockResolvedValue([{ value: 1 }]);

      const result = await adminRepo.listEvents(
        db,
        { status: "pending" },
        { limit: 10, offset: 0 }
      );

      expect(result.data).toEqual(mockEvents);
      expect(result.total).toBe(1);
    });

    it("returns empty data for no matching events", async () => {
      mockQueryEventsFindMany.mockResolvedValue([]);
      mockSelectWhere.mockResolvedValue([{ value: 0 }]);

      const result = await adminRepo.listEvents(
        db,
        { status: "approved" },
        { limit: 10, offset: 0 }
      );

      expect(result.data).toEqual([]);
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

  // ── setEventStatus ───────────────────────────────────────────

  describe("setEventStatus", () => {
    it("updates event status", async () => {
      await adminRepo.setEventStatus(db, "e1", "approved");

      expect(db.update).toHaveBeenCalled();
      // set() is called via mockUpdateSetWhere which is the mock for .set
      expect(mockUpdateSetWhere).toHaveBeenCalledWith(
        expect.objectContaining({ status: "approved" })
      );
    });

    it("updates event status to rejected", async () => {
      await adminRepo.setEventStatus(db, "e1", "rejected");

      expect(mockUpdateSetWhere).toHaveBeenCalledWith(
        expect.objectContaining({ status: "rejected" })
      );
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
