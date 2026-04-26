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
    findReviewById: vi.fn(),
    softDeleteReview: vi.fn(),
  },
}));

import { adminRepository } from "./admin.repository";
import { adminService } from "./admin.service";

describe("adminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "u1";
  const eventId = "e1";
  const reviewId = "r1";

  describe("listUsers", () => {
    it("delegates to repository", async () => {
      const mockResult = { data: [], total: 0 };
      vi.mocked(adminRepository.listUsers).mockResolvedValue(mockResult);

      const result = await adminService.listUsers({ status: "active" });

      expect(result).toBe(mockResult);
      expect(adminRepository.listUsers).toHaveBeenCalledWith(
        { status: "active" },
        { limit: 20, offset: 0 }
      );
    });
  });

  describe("setUserStatus", () => {
    it("updates status if user exists", async () => {
      vi.mocked(adminRepository.findUserById).mockResolvedValue({ id: userId } as never);
      vi.mocked(adminRepository.setUserStatus).mockResolvedValue({
        id: userId,
        status: "suspended",
      } as never);

      const result = await adminService.setUserStatus(userId, "suspended");

      expect(result.status).toBe("suspended");
      expect(adminRepository.setUserStatus).toHaveBeenCalledWith(userId, "suspended");
    });

    it("throws NOT_FOUND if user missing", async () => {
      vi.mocked(adminRepository.findUserById).mockResolvedValue(undefined);

      await expect(adminService.setUserStatus(userId, "banned")).rejects.toThrow("NOT_FOUND");
    });
  });

  describe("approveEvent", () => {
    it("approves pending event", async () => {
      vi.mocked(adminRepository.findEventById).mockResolvedValue({
        id: eventId,
        status: "pending",
      } as never);
      vi.mocked(adminRepository.findEventWithDetailsById).mockResolvedValue({
        id: eventId,
        status: "approved",
      } as never);

      const result = await adminService.approveEvent(eventId);

      expect(result.status).toBe("approved");
      expect(adminRepository.setEventStatus).toHaveBeenCalledWith(eventId, "approved");
    });
  });

  describe("listAllReviews", () => {
    it("delegates to repository", async () => {
      const mockResult = { data: [], total: 0 };
      vi.mocked(adminRepository.listAllReviews).mockResolvedValue(mockResult);

      const result = await adminService.listAllReviews();

      expect(result).toBe(mockResult);
    });
  });

  describe("deleteReview", () => {
    it("deletes review if exists", async () => {
      vi.mocked(adminRepository.findReviewById).mockResolvedValue({ id: reviewId } as never);

      await adminService.deleteReview(reviewId);

      expect(adminRepository.softDeleteReview).toHaveBeenCalledWith(reviewId);
    });
  });
});
