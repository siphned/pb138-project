import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./reviews.repository", () => ({
  reviewsRepository: {
    findReviews: vi.fn(),
    averageRating: vi.fn(),
    findUserReview: vi.fn(),
    insertReview: vi.fn(),
    findReviewWithUser: vi.fn(),
    hasPurchasedProduct: vi.fn(),
    findById: vi.fn(),
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
  const _winemakerId = "wm1";
  const reviewId = "r1";

  describe("listProductReviews", () => {
    it("returns reviews and averageRating together", async () => {
      const mockReviews = [{ id: "r1" }];
      vi.mocked(reviewsRepository.findReviews).mockResolvedValue(mockReviews as never);
      vi.mocked(reviewsRepository.averageRating).mockResolvedValue(4.5);

      const result = await reviewsService.listProductReviews(productId);

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(4.5);
      expect(reviewsRepository.findReviews).toHaveBeenCalledWith(productId, "product");
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
