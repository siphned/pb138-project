import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./reviews.repository", () => ({
  reviewsRepository: {
    averageProductRating: vi.fn(),
    averageWinemakerRating: vi.fn(),
    findProductReviews: vi.fn(),
    findWinemakerReviews: vi.fn(),
    findProductReview: vi.fn(),
    findWinemakerReview: vi.fn(),
    findProductReviewById: vi.fn(),
    findWinemakerReviewById: vi.fn(),
    findProductReviewWithUser: vi.fn(),
    findWinemakerReviewWithUser: vi.fn(),
    hasPurchasedProduct: vi.fn(),
    insertProductReview: vi.fn(),
    insertWinemakerReview: vi.fn(),
    softDeleteProductReview: vi.fn(),
    softDeleteWinemakerReview: vi.fn(),
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
    it("returns reviews and averageRating together", async () => {
      const mockReviews = [{ id: "r1" }];
      vi.mocked(reviewsRepository.findProductReviews).mockResolvedValue(mockReviews as never);
      vi.mocked(reviewsRepository.averageProductRating).mockResolvedValue(4.5);

      const result = await reviewsService.listProductReviews(productId);

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(4.5);
    });
  });

  describe("createProductReview", () => {
    it("creates review for verified purchaser with no prior review", async () => {
      vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true);
      vi.mocked(reviewsRepository.findProductReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepository.insertProductReview).mockResolvedValue({ id: reviewId } as never);
      vi.mocked(reviewsRepository.findProductReviewWithUser).mockResolvedValue({
        id: reviewId,
      } as never);

      const result = await reviewsService.createProductReview(userId, productId, { rating: 5 });

      expect(result.id).toBe(reviewId);
      expect(reviewsRepository.insertProductReview).toHaveBeenCalledWith(userId, productId, {
        rating: 5,
      });
    });

    it("throws NOT_PURCHASED if user has not bought the product", async () => {
      vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(false);

      await expect(
        reviewsService.createProductReview(userId, productId, { rating: 5 })
      ).rejects.toThrow("NOT_PURCHASED");
    });

    it("throws DUPLICATE_REVIEW if user already reviewed", async () => {
      vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true);
      vi.mocked(reviewsRepository.findProductReview).mockResolvedValue({ id: reviewId } as never);

      await expect(
        reviewsService.createProductReview(userId, productId, { rating: 5 })
      ).rejects.toThrow("DUPLICATE_REVIEW");
    });
  });

  describe("deleteProductReview", () => {
    it("allows owner to delete their own review", async () => {
      vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue({
        id: reviewId,
        userId,
      } as never);

      await reviewsService.deleteProductReview(reviewId, productId, userId, "customer");

      expect(reviewsRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId);
    });

    it("allows admin to delete any review", async () => {
      vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue({
        id: reviewId,
        userId: "other",
      } as never);

      await reviewsService.deleteProductReview(reviewId, productId, userId, "admin");

      expect(reviewsRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId);
    });

    it("throws FORBIDDEN when non-owner tries to delete", async () => {
      vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue({
        id: reviewId,
        userId: "other",
      } as never);

      await expect(
        reviewsService.deleteProductReview(reviewId, productId, userId, "customer")
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("deleteWinemakerReview", () => {
    it("allows owner to delete their own winemaker review", async () => {
      vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue({
        id: reviewId,
        userId,
      } as never);

      await reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, "customer");

      expect(reviewsRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId);
    });
  });
});
