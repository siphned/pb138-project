import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { emailService } from "../email/email.service";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import * as adminRepo from "./admin.repository";
import { adminService } from "./admin.service";

vi.mock("./admin.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./admin.repository")>();
  return {
    ...actual,
    findEventById: vi.fn(),
    findEventWithDetailsById: vi.fn(),
    findReviewById: vi.fn(),
    findUserById: vi.fn(),
    listAllReviews: vi.fn(),
    listEvents: vi.fn(),
    listUsers: vi.fn(),
    setEventStatus: vi.fn(),
    setUserStatus: vi.fn(),
    softDeleteReview: vi.fn(),
  };
});

vi.mock("../email/email.service", () => ({
  emailService: {
    sendEventApproval: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../winemakers/winemakers.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../winemakers/winemakers.repository")>();
  return {
    ...actual,
    findById: vi.fn(),
  };
});

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
      vi.mocked(adminRepo.listUsers).mockResolvedValue({ data: mockData as never, total: 1 });

      const result = await adminService.listUsers({ status: "active" }, { limit: 10, offset: 0 });

      expect(result.data).toBe(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe("setUserStatus", () => {
    it("updates status if user found", async () => {
      const mockUser = { id: userId };
      vi.mocked(adminRepo.findUserById).mockResolvedValue(mockUser as never);
      vi.mocked(adminRepo.setUserStatus).mockResolvedValue(mockUser as never);

      await adminService.setUserStatus(userId, "suspended");

      expect(adminRepo.setUserStatus).toHaveBeenCalledWith(db, userId, "suspended");
    });

    it("throws NOT_FOUND if user not found", async () => {
      vi.mocked(adminRepo.findUserById).mockResolvedValue(undefined);
      await expect(adminService.setUserStatus(userId, "active")).rejects.toThrow("User not found");
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

      vi.mocked(adminRepo.findEventById).mockResolvedValue(mockEvent as never);
      vi.mocked(adminRepo.findEventWithDetailsById).mockResolvedValue(mockEvent as never);
      vi.mocked(winemakersRepo.findById).mockResolvedValue(mockWinemaker as never);

      await adminService.approveEvent(eventId);

      expect(adminRepo.setEventStatus).toHaveBeenCalledWith(db, eventId, "approved");
      expect(emailService.sendEventApproval).toHaveBeenCalled();
    });
  });

  describe("listAllReviews", () => {
    it("delegates to repository", async () => {
      vi.mocked(adminRepo.listAllReviews).mockResolvedValue({ data: [], total: 0 });
      await adminService.listAllReviews();
      expect(adminRepo.listAllReviews).toHaveBeenCalled();
    });
  });

  describe("deleteReview", () => {
    it("soft deletes review if found", async () => {
      vi.mocked(adminRepo.findReviewById).mockResolvedValue({ id: reviewId } as never);
      await adminService.deleteReview(reviewId);
      expect(adminRepo.softDeleteReview).toHaveBeenCalledWith(db, reviewId);
    });
  });
});
