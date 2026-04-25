import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./admin.repository", () => ({
  adminRepository: {
    listUsers: vi.fn(),
    findUserById: vi.fn(),
    setUserStatus: vi.fn(),
    listEvents: vi.fn(),
    findEventById: vi.fn(),
    findEventWithDetailsById: vi.fn(),
    setEventStatus: vi.fn(),
    listAllReviews: vi.fn(),
    findProductReviewById: vi.fn(),
    findWinemakerReviewById: vi.fn(),
    softDeleteProductReview: vi.fn(),
    softDeleteWinemakerReview: vi.fn(),
  },
}));

import type { AdminEventRow, AdminUserRow } from "./admin.repository";
import { adminRepository } from "./admin.repository";
import { adminService } from "./admin.service";

const userId = "11111111-1111-1111-1111-111111111111";
const eventId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const reviewId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const winemakerId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

const mockUser: AdminUserRow = {
  id: userId,
  fname: "Test",
  lname: "User",
  email: "test@example.com",
  role: "user",
  status: "active",
  createdAt: new Date("2026-01-01"),
  deletedAt: null,
};

const mockPendingEvent = {
  id: eventId,
  name: "Wine Fest",
  status: "pending" as const,
  winemakerId,
  deletedAt: null,
};

const mockApprovedEvent = { ...mockPendingEvent, status: "approved" as const };
const mockRejectedEvent = { ...mockPendingEvent, status: "rejected" as const };

const mockEventWithDetails = {
  ...mockApprovedEvent,
  description: null,
  addressId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  capacity: 20,
  startTime: new Date("2026-06-01"),
  endTime: new Date("2026-06-02"),
  inviteType: "open",
  visibility: "public",
  createdAt: new Date("2026-01-01"),
  updatedAt: null,
  winemaker: { id: winemakerId, name: "Test Winery" },
  address: null,
} as unknown as AdminEventRow;

beforeEach(() => vi.clearAllMocks());

// ─── listUsers ────────────────────────────────────────────────────────────────

describe("listUsers", () => {
  it("returns paginated result from repository", async () => {
    vi.mocked(adminRepository.listUsers).mockResolvedValue({ data: [mockUser], total: 1 });

    const result = await adminService.listUsers({}, { page: 1, limit: 20 });

    expect(result).toEqual({ data: [mockUser], page: 1, limit: 20, total: 1 });
    expect(adminRepository.listUsers).toHaveBeenCalledWith({}, { limit: 20, offset: 0 });
  });

  it("passes status and role filters to repository", async () => {
    vi.mocked(adminRepository.listUsers).mockResolvedValue({ data: [], total: 0 });

    await adminService.listUsers({ status: "suspended", role: "user" }, { page: 2, limit: 10 });

    expect(adminRepository.listUsers).toHaveBeenCalledWith(
      { status: "suspended", role: "user" },
      { limit: 10, offset: 10 }
    );
  });
});

// ─── changeUserStatus ─────────────────────────────────────────────────────────

describe("changeUserStatus", () => {
  it("throws NOT_FOUND when user does not exist", async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue(undefined);

    await expect(adminService.changeUserStatus(userId, "suspended")).rejects.toThrow("NOT_FOUND");
    expect(adminRepository.setUserStatus).not.toHaveBeenCalled();
  });

  it("updates and returns user when user exists", async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue({ ...mockUser } as never);
    vi.mocked(adminRepository.setUserStatus).mockResolvedValue({
      ...mockUser,
      status: "suspended",
    });

    const result = await adminService.changeUserStatus(userId, "suspended");

    expect(result.status).toBe("suspended");
    expect(adminRepository.setUserStatus).toHaveBeenCalledWith(userId, "suspended");
  });
});

// ─── listEvents ───────────────────────────────────────────────────────────────

describe("listEvents", () => {
  it("defaults to pending status", async () => {
    vi.mocked(adminRepository.listEvents).mockResolvedValue({ data: [], total: 0 });

    await adminService.listEvents({}, { page: 1, limit: 20 });

    expect(adminRepository.listEvents).toHaveBeenCalledWith(
      { status: "pending" },
      { limit: 20, offset: 0 }
    );
  });

  it("passes explicit status filter", async () => {
    vi.mocked(adminRepository.listEvents).mockResolvedValue({ data: [], total: 0 });

    await adminService.listEvents({ status: "approved" }, { page: 1, limit: 20 });

    expect(adminRepository.listEvents).toHaveBeenCalledWith(
      { status: "approved" },
      { limit: 20, offset: 0 }
    );
  });
});

// ─── setEventStatus ───────────────────────────────────────────────────────────

describe("setEventStatus", () => {
  it("throws NOT_FOUND when event does not exist", async () => {
    vi.mocked(adminRepository.findEventById).mockResolvedValue(undefined);

    await expect(adminService.setEventStatus(eventId, "approved")).rejects.toThrow("NOT_FOUND");
    expect(adminRepository.setEventStatus).not.toHaveBeenCalled();
  });

  it("throws CONFLICT when event is already approved", async () => {
    vi.mocked(adminRepository.findEventById).mockResolvedValue(mockApprovedEvent as never);

    await expect(adminService.setEventStatus(eventId, "rejected")).rejects.toThrow("CONFLICT");
    expect(adminRepository.setEventStatus).not.toHaveBeenCalled();
  });

  it("throws CONFLICT when event is already rejected", async () => {
    vi.mocked(adminRepository.findEventById).mockResolvedValue(mockRejectedEvent as never);

    await expect(adminService.setEventStatus(eventId, "approved")).rejects.toThrow("CONFLICT");
    expect(adminRepository.setEventStatus).not.toHaveBeenCalled();
  });

  it("approves a pending event and returns it with details", async () => {
    vi.mocked(adminRepository.findEventById).mockResolvedValue(mockPendingEvent as never);
    vi.mocked(adminRepository.setEventStatus).mockResolvedValue(undefined);
    vi.mocked(adminRepository.findEventWithDetailsById).mockResolvedValue(mockEventWithDetails);

    const result = await adminService.setEventStatus(eventId, "approved");

    expect(result.status).toBe("approved");
    expect(adminRepository.setEventStatus).toHaveBeenCalledWith(eventId, "approved");
    expect(adminRepository.findEventWithDetailsById).toHaveBeenCalledWith(eventId);
  });
});

// ─── listReviews ─────────────────────────────────────────────────────────────

describe("listReviews", () => {
  it("returns paginated combined reviews", async () => {
    const mockReview = {
      id: reviewId,
      type: "product" as const,
      userId,
      targetId: "prod-1",
      rating: 5,
      body: "Great!",
      createdAt: new Date(),
    };
    vi.mocked(adminRepository.listAllReviews).mockResolvedValue({ data: [mockReview], total: 1 });

    const result = await adminService.listReviews({ page: 1, limit: 20 });

    expect(result).toEqual({ data: [mockReview], page: 1, limit: 20, total: 1 });
  });
});

// ─── deleteReview ─────────────────────────────────────────────────────────────

describe("deleteReview", () => {
  it("throws NOT_FOUND for missing product review", async () => {
    vi.mocked(adminRepository.findProductReviewById).mockResolvedValue(undefined);

    await expect(adminService.deleteReview(reviewId, "product")).rejects.toThrow("NOT_FOUND");
    expect(adminRepository.softDeleteProductReview).not.toHaveBeenCalled();
  });

  it("soft-deletes an existing product review", async () => {
    vi.mocked(adminRepository.findProductReviewById).mockResolvedValue({ id: reviewId } as never);
    vi.mocked(adminRepository.softDeleteProductReview).mockResolvedValue();

    await adminService.deleteReview(reviewId, "product");

    expect(adminRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId);
  });

  it("throws NOT_FOUND for missing winemaker review", async () => {
    vi.mocked(adminRepository.findWinemakerReviewById).mockResolvedValue(undefined);

    await expect(adminService.deleteReview(reviewId, "winemaker")).rejects.toThrow("NOT_FOUND");
    expect(adminRepository.softDeleteWinemakerReview).not.toHaveBeenCalled();
  });

  it("soft-deletes an existing winemaker review", async () => {
    vi.mocked(adminRepository.findWinemakerReviewById).mockResolvedValue({ id: reviewId } as never);
    vi.mocked(adminRepository.softDeleteWinemakerReview).mockResolvedValue();

    await adminService.deleteReview(reviewId, "winemaker");

    expect(adminRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId);
  });
});
