import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./admin.repository", () => ({
  adminRepository: {
    findEventById: vi.fn(),
    findEventWithDetailsById: vi.fn(),
    findProductReviewById: vi.fn(),
    findUserById: vi.fn(),
    findWinemakerReviewById: vi.fn(),
    listAllReviews: vi.fn(),
    listEvents: vi.fn(),
    listUsers: vi.fn(),
    setEventStatus: vi.fn(),
    setUserStatus: vi.fn(),
    softDeleteProductReview: vi.fn(),
    softDeleteWinemakerReview: vi.fn(),
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
    it("delegates to repository with filters and pagination", async () => {
      const mockData = [{ id: userId }];
      vi.mocked(adminRepository.listUsers).mockResolvedValue({ data: mockData as never, total: 1 });

      const result = await adminService.listUsers({ status: "active" }, { page: 1, limit: 10 });

      expect(result.data).toBe(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe("changeUserStatus", () => {
    it("updates status if user exists", async () => {
      vi.mocked(adminRepository.findUserById).mockResolvedValue({ id: userId } as never);
      vi.mocked(adminRepository.setUserStatus).mockResolvedValue({
        id: userId,
        status: "suspended",
      } as never);

      const result = await adminService.changeUserStatus(userId, "suspended");

      expect(result.status).toBe("suspended");
      expect(adminRepository.setUserStatus).toHaveBeenCalledWith(userId, "suspended");
    });

    it("throws NOT_FOUND if user missing", async () => {
      vi.mocked(adminRepository.findUserById).mockResolvedValue(undefined);

      await expect(adminService.changeUserStatus(userId, "banned")).rejects.toThrow("NOT_FOUND");
    });
  });

  describe("setEventStatus", () => {
    it("approves pending event", async () => {
      vi.mocked(adminRepository.findEventById).mockResolvedValue({
        id: eventId,
        status: "pending",
      } as never);
      vi.mocked(adminRepository.findEventWithDetailsById).mockResolvedValue({
        id: eventId,
        status: "approved",
      } as never);

      const result = await adminService.setEventStatus(eventId, "approved");

      expect(result.status).toBe("approved");
      expect(adminRepository.setEventStatus).toHaveBeenCalledWith(eventId, "approved");
    });

    it("throws CONFLICT if event is not pending", async () => {
      vi.mocked(adminRepository.findEventById).mockResolvedValue({
        id: eventId,
        status: "approved",
      } as never);

      await expect(adminService.setEventStatus(eventId, "approved")).rejects.toThrow("CONFLICT");
    });
  });

  describe("listReviews", () => {
    it("delegates to repository with pagination", async () => {
      const mockData = [{ id: "r1" }];
      vi.mocked(adminRepository.listAllReviews).mockResolvedValue({
        data: mockData as never,
        total: 1,
      });

      const result = await adminService.listReviews({ page: 1, limit: 10 });

      expect(result.data).toBe(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe("deleteReview", () => {
    it("soft-deletes a product review if it exists", async () => {
      vi.mocked(adminRepository.findProductReviewById).mockResolvedValue({ id: reviewId } as never);

      await adminService.deleteReview(reviewId, "product");

      expect(adminRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId);
    });

    it("throws NOT_FOUND if product review does not exist", async () => {
      vi.mocked(adminRepository.findProductReviewById).mockResolvedValue(undefined);

      await expect(adminService.deleteReview(reviewId, "product")).rejects.toThrow("NOT_FOUND");
    });

    it("soft-deletes a winemaker review if it exists", async () => {
      vi.mocked(adminRepository.findWinemakerReviewById).mockResolvedValue({
        id: reviewId,
      } as never);

      await adminService.deleteReview(reviewId, "winemaker");

      expect(adminRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId);
    });
  });
});
