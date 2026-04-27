import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailService } from "../email";
import { winemakersRepository } from "../winemakers/winemakers.repository";
import { adminRepository } from "./admin.repository";
import { adminService } from "./admin.service";

vi.mock("./admin.repository", () => ({
  adminRepository: {
    findEventById: vi.fn(),
    findEventWithDetailsById: vi.fn(),
    findProductReviewById: vi.fn(),
    findReviewById: vi.fn(),
    findUserById: vi.fn(),
    findWinemakerReviewById: vi.fn(),
    listAllReviews: vi.fn(),
    listEvents: vi.fn(),
    listUsers: vi.fn(),
    setEventStatus: vi.fn(),
    setUserStatus: vi.fn(),
    softDeleteProductReview: vi.fn(),
    softDeleteReview: vi.fn(),
    softDeleteWinemakerReview: vi.fn(),
  },
}));

vi.mock("../email/email.service", () => ({
  emailService: {
    sendEventApproval: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../winemakers/winemakers.repository", () => ({
  winemakersRepository: {
    findById: vi.fn(),
  },
}));

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

      const result = await adminService.listUsers({ status: "active" }, { limit: 10, offset: 0 });

      expect(result.data).toBe(mockData);
      expect(result.total).toBe(1);
      expect(adminRepository.listUsers).toHaveBeenCalledWith(
        { status: "active" },
        { limit: 10, offset: 0 }
      );
    });
  });

  describe("setUserStatus", () => {
    it("updates status if user found", async () => {
      const mockUser = { id: userId };
      vi.mocked(adminRepository.findUserById).mockResolvedValue(mockUser as never);
      vi.mocked(adminRepository.setUserStatus).mockResolvedValue(mockUser as never);

      await adminService.setUserStatus(userId, "suspended");

      expect(adminRepository.setUserStatus).toHaveBeenCalledWith(userId, "suspended");
    });

    it("throws NOT_FOUND if user not found", async () => {
      vi.mocked(adminRepository.findUserById).mockResolvedValue(undefined);
      await expect(adminService.setUserStatus(userId, "active")).rejects.toThrow("NOT_FOUND");
    });
  });

  describe("approveEvent", () => {
    it("approves pending event and sends email", async () => {
      const mockEvent = {
        endTime: new Date(),
        id: eventId,
        name: "Wine Fest",
        startTime: new Date(),
        status: "pending",
        winemakerId: "wm1",
      };
      const mockWinemaker = { email: "wine@test.com", id: "wm1", name: "Winery" };

      vi.mocked(adminRepository.findEventById).mockResolvedValue(mockEvent as never);
      vi.mocked(adminRepository.findEventWithDetailsById).mockResolvedValue(mockEvent as never);
      vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemaker as never);

      await adminService.approveEvent(eventId);

      expect(adminRepository.setEventStatus).toHaveBeenCalledWith(eventId, "approved");
      expect(emailService.sendEventApproval).toHaveBeenCalled();
    });
  });

  describe("listAllReviews", () => {
    it("delegates to repository", async () => {
      vi.mocked(adminRepository.listAllReviews).mockResolvedValue({ data: [], total: 0 });
      await adminService.listAllReviews();
      expect(adminRepository.listAllReviews).toHaveBeenCalled();
    });
  });

  describe("deleteReview", () => {
    it("soft deletes review if found", async () => {
      vi.mocked(adminRepository.findReviewById).mockResolvedValue({ id: reviewId } as never);
      await adminService.deleteReview(reviewId);
      expect(adminRepository.softDeleteReview).toHaveBeenCalledWith(reviewId);
    });
  });
});
