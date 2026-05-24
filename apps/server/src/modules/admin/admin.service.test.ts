import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
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
=======

vi.mock("./admin.repository", () => ({
  adminRepository: {
    findEventById: vi.fn(),
    findEventWithDetailsById: vi.fn(),
    findProductReviewById: vi.fn(),
    findReviewById: vi.fn(),
    findUserById: vi.fn(),
    findWinemakerReviewById: vi.fn(),
>>>>>>> origin/main
    listAllReviews: vi.fn(),
    listEvents: vi.fn(),
    listUsers: vi.fn(),
    setEventStatus: vi.fn(),
    setUserStatus: vi.fn(),
<<<<<<< HEAD
    softDeleteReview: vi.fn(),
  };
});
=======
    softDeleteProductReview: vi.fn(),
    softDeleteReview: vi.fn(),
    softDeleteWinemakerReview: vi.fn(),
  },
}));
>>>>>>> origin/main

vi.mock("../email/email.service", () => ({
  emailService: {
    sendEventApproval: vi.fn().mockResolvedValue(undefined),
  },
}));

<<<<<<< HEAD
vi.mock("../winemakers/winemakers.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../winemakers/winemakers.repository")>();
  return {
    ...actual,
    findById: vi.fn(),
  };
});
=======
vi.mock("../winemakers/winemakers.repository", () => ({
  winemakersRepository: {
    findById: vi.fn(),
  },
}));

import { emailService } from "../email";
import { winemakersRepository } from "../winemakers/winemakers.repository";
import { adminRepository } from "./admin.repository";
import { adminService } from "./admin.service";
>>>>>>> origin/main

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
<<<<<<< HEAD
      vi.mocked(adminRepo.listUsers).mockResolvedValue({ data: mockData as never, total: 1 });
=======
      vi.mocked(adminRepository.listUsers).mockResolvedValue({ data: mockData as never, total: 1 });
>>>>>>> origin/main

      const result = await adminService.listUsers({ status: "active" }, { limit: 10, offset: 0 });

      expect(result.data).toBe(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe("setUserStatus", () => {
    it("updates status if user found", async () => {
      const mockUser = { id: userId };
<<<<<<< HEAD
      vi.mocked(adminRepo.findUserById).mockResolvedValue(mockUser as never);
      vi.mocked(adminRepo.setUserStatus).mockResolvedValue(mockUser as never);

      await adminService.setUserStatus(userId, "suspended");

      expect(adminRepo.setUserStatus).toHaveBeenCalledWith(db, userId, "suspended");
    });

    it("throws NOT_FOUND if user not found", async () => {
      vi.mocked(adminRepo.findUserById).mockResolvedValue(undefined);
      await expect(adminService.setUserStatus(userId, "active")).rejects.toThrow("User not found");
=======
      vi.mocked(adminRepository.findUserById).mockResolvedValue(mockUser as never);
      vi.mocked(adminRepository.setUserStatus).mockResolvedValue(mockUser as never);

      await adminService.setUserStatus(userId, "suspended");

      expect(adminRepository.setUserStatus).toHaveBeenCalledWith(userId, "suspended");
    });

    it("throws NOT_FOUND if user not found", async () => {
      vi.mocked(adminRepository.findUserById).mockResolvedValue(undefined);
      await expect(adminService.setUserStatus(userId, "active")).rejects.toThrow("NOT_FOUND");
>>>>>>> origin/main
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

<<<<<<< HEAD
      vi.mocked(adminRepo.findEventById).mockResolvedValue(mockEvent as never);
      vi.mocked(adminRepo.findEventWithDetailsById).mockResolvedValue(mockEvent as never);
      vi.mocked(winemakersRepo.findById).mockResolvedValue(mockWinemaker as never);

      await adminService.approveEvent(eventId);

      expect(adminRepo.setEventStatus).toHaveBeenCalledWith(db, eventId, "approved");
=======
      vi.mocked(adminRepository.findEventById).mockResolvedValue(mockEvent as never);
      vi.mocked(adminRepository.findEventWithDetailsById).mockResolvedValue(mockEvent as never);
      vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemaker as never);

      await adminService.approveEvent(eventId);

      expect(adminRepository.setEventStatus).toHaveBeenCalledWith(eventId, "approved");
>>>>>>> origin/main
      expect(emailService.sendEventApproval).toHaveBeenCalled();
    });
  });

  describe("listAllReviews", () => {
    it("delegates to repository", async () => {
<<<<<<< HEAD
      vi.mocked(adminRepo.listAllReviews).mockResolvedValue({ data: [], total: 0 });
      await adminService.listAllReviews();
      expect(adminRepo.listAllReviews).toHaveBeenCalled();
=======
      vi.mocked(adminRepository.listAllReviews).mockResolvedValue({ data: [], total: 0 });
      await adminService.listAllReviews();
      expect(adminRepository.listAllReviews).toHaveBeenCalled();
>>>>>>> origin/main
    });
  });

  describe("deleteReview", () => {
    it("soft deletes review if found", async () => {
<<<<<<< HEAD
      vi.mocked(adminRepo.findReviewById).mockResolvedValue({ id: reviewId } as never);
      await adminService.deleteReview(reviewId);
      expect(adminRepo.softDeleteReview).toHaveBeenCalledWith(db, reviewId);
=======
      vi.mocked(adminRepository.findReviewById).mockResolvedValue({ id: reviewId } as never);
      await adminService.deleteReview(reviewId);
      expect(adminRepository.softDeleteReview).toHaveBeenCalledWith(reviewId);
>>>>>>> origin/main
    });
  });
});
