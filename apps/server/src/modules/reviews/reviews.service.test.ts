import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./reviews.repository", () => ({
  reviewsRepository: {
    averageRating: vi.fn(),
    countReviews: vi.fn(),
    findById: vi.fn(),
    findReviews: vi.fn(),
    findReviewWithUser: vi.fn(),
    findUserReview: vi.fn(),
    hasPurchasedProduct: vi.fn(),
    insertReview: vi.fn(),
    softDelete: vi.fn(),
  },
}));

import { reviewsRepository } from "./reviews.repository";
import { reviewsService } from "./reviews.service";

describe("reviewsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "u1";
  const productId = "p1";
  const winemakerId = "w1";
  const reviewId = "r1";

  describe("listProductReviews", () => {
    it("returns reviews, totalCount, and averageRating", async () => {
      const mockReviews = [{ id: "r1" }];
      vi.mocked(reviewsRepository.findReviews).mockResolvedValue(mockReviews as never);
      vi.mocked(reviewsRepository.averageRating).mockResolvedValue(4.5);
      vi.mocked(reviewsRepository.countReviews).mockResolvedValue(42);

      const result = await reviewsService.listProductReviews(productId, {
        limit: 12,
        page: 1,
        sort: "newest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(4.5);
      expect(result.totalCount).toBe(42);
      expect(reviewsRepository.findReviews).toHaveBeenCalledWith(productId, "product", {
        limit: 12,
        offset: 0,
        sort: "newest",
      });
      expect(reviewsRepository.countReviews).toHaveBeenCalledWith(productId, "product");
    });
  });

  describe("listWinemakerReviews", () => {
    it("returns reviews, totalCount, and averageRating", async () => {
      const mockReviews = [{ id: "r2" }];
      vi.mocked(reviewsRepository.findReviews).mockResolvedValue(mockReviews as never);
      vi.mocked(reviewsRepository.averageRating).mockResolvedValue(3.8);
      vi.mocked(reviewsRepository.countReviews).mockResolvedValue(7);

      const result = await reviewsService.listWinemakerReviews(winemakerId, {
        limit: 5,
        page: 2,
        sort: "highest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(3.8);
      expect(result.totalCount).toBe(7);
      expect(reviewsRepository.findReviews).toHaveBeenCalledWith(winemakerId, "winemaker", {
        limit: 5,
        offset: 5,
        sort: "highest",
      });
      expect(reviewsRepository.countReviews).toHaveBeenCalledWith(winemakerId, "winemaker");
    });
  });

  describe("createProductReview", () => {
    it("creates review for verified purchaser with no prior review", async () => {
      vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true);
      vi.mocked(reviewsRepository.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepository.insertReview).mockResolvedValue({ id: reviewId } as never);
      vi.mocked(reviewsRepository.findReviewWithUser).mockResolvedValue({ id: reviewId } as never);

      const result = await reviewsService.createProductReview(userId, productId, { rating: 5 });

      expect(result.id).toBe(reviewId);
      expect(reviewsRepository.insertReview).toHaveBeenCalledWith(userId, productId, "product", {
        rating: 5,
      });
    });

    it("throws NOT_PURCHASED if no order found", async () => {
      vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(false);

      await expect(
        reviewsService.createProductReview(userId, productId, { rating: 5 })
      ).rejects.toThrow("NOT_PURCHASED");
    });
  });

  describe("deleteReview", () => {
    it("allows owner to delete their own review", async () => {
      vi.mocked(reviewsRepository.findUserReview).mockResolvedValue({ id: reviewId } as never);

      await reviewsService.deleteReview(reviewId, userId, "user", productId, "product");

      expect(reviewsRepository.softDelete).toHaveBeenCalledWith(reviewId);
    });

    it("allows admin to delete any review", async () => {
      vi.mocked(reviewsRepository.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepository.findById).mockResolvedValue({ id: reviewId } as never);

      await reviewsService.deleteReview(reviewId, userId, "admin", productId, "product");

      expect(reviewsRepository.softDelete).toHaveBeenCalledWith(reviewId);
    });
  });
});
