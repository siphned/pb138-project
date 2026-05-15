import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as reviewsRepo from "./reviews.repository";
import { reviewsService } from "./reviews.service";

vi.mock("./reviews.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./reviews.repository")>();
  return {
    ...actual,
    averageRating: vi.fn(),
    countReviews: vi.fn(),
    findById: vi.fn(),
    findReviews: vi.fn(),
    findReviewWithUser: vi.fn(),
    findUserReview: vi.fn(),
    hasPurchasedFromWinemaker: vi.fn(),
    hasPurchasedProduct: vi.fn(),
    hasPurchasedWine: vi.fn(),
    insertReview: vi.fn(),
    softDelete: vi.fn(),
  };
});

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
      vi.mocked(reviewsRepo.findReviews).mockResolvedValue(mockReviews as any);
      vi.mocked(reviewsRepo.averageRating).mockResolvedValue(4.5);
      vi.mocked(reviewsRepo.countReviews).mockResolvedValue(42);

      const result = await reviewsService.listProductReviews(productId, {
        limit: 12,
        page: 1,
        sort: "newest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(4.5);
      expect(result.totalCount).toBe(42);
      expect(reviewsRepo.findReviews).toHaveBeenCalledWith(db, productId, "product", {
        limit: 12,
        offset: 0,
        sort: "newest",
      });
    });
  });

  describe("listWinemakerReviews", () => {
    it("returns reviews, totalCount, and averageRating", async () => {
      const mockReviews = [{ id: "r2" }];
      vi.mocked(reviewsRepo.findReviews).mockResolvedValue(mockReviews as any);
      vi.mocked(reviewsRepo.averageRating).mockResolvedValue(3.8);
      vi.mocked(reviewsRepo.countReviews).mockResolvedValue(7);

      const result = await reviewsService.listWinemakerReviews(winemakerId, {
        limit: 5,
        page: 2,
        sort: "highest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(3.8);
      expect(result.totalCount).toBe(7);
      expect(reviewsRepo.findReviews).toHaveBeenCalledWith(db, winemakerId, "winemaker", {
        limit: 5,
        offset: 5,
        sort: "highest",
      });
    });
  });

  describe("createProductReview", () => {
    it("creates review for verified purchaser with no prior review", async () => {
      vi.mocked(reviewsRepo.hasPurchasedProduct).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepo.insertReview).mockResolvedValue({ id: reviewId } as any);
      vi.mocked(reviewsRepo.findReviewWithUser).mockResolvedValue({ id: reviewId } as any);

      const result = await reviewsService.createProductReview(userId, productId, { rating: 5 });

      expect(result.id).toBe(reviewId);
      expect(reviewsRepo.insertReview).toHaveBeenCalledWith(db, userId, productId, "product", {
        rating: 5,
      });
    });
  });

  describe("createWinemakerReview", () => {
    it("throws ForbiddenError when user has no qualifying purchase", async () => {
      vi.mocked(reviewsRepo.hasPurchasedFromWinemaker).mockResolvedValue(false);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);

      await expect(
        reviewsService.createWinemakerReview(userId, winemakerId, { rating: 4 })
      ).rejects.toMatchObject({ code: "NOT_PURCHASED", statusCode: 403 });
    });

    it("throws BadRequestError when user already reviewed this winemaker", async () => {
      vi.mocked(reviewsRepo.hasPurchasedFromWinemaker).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue({ id: reviewId } as any);

      await expect(
        reviewsService.createWinemakerReview(userId, winemakerId, { rating: 4 })
      ).rejects.toMatchObject({ code: "ALREADY_REVIEWED", statusCode: 400 });
    });

    it("creates and returns the review when all checks pass", async () => {
      vi.mocked(reviewsRepo.hasPurchasedFromWinemaker).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepo.insertReview).mockResolvedValue({ id: reviewId } as any);
      vi.mocked(reviewsRepo.findReviewWithUser).mockResolvedValue({ id: reviewId } as any);

      const result = await reviewsService.createWinemakerReview(userId, winemakerId, { rating: 4 });

      expect(result.id).toBe(reviewId);
      expect(reviewsRepo.insertReview).toHaveBeenCalledWith(db, userId, winemakerId, "winemaker", {
        rating: 4,
      });
    });
  });

  describe("deleteReview", () => {
    it("allows owner to delete their own review", async () => {
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue({ id: reviewId } as any);

      await reviewsService.deleteReview(reviewId, userId, "user", productId, "product");

      expect(reviewsRepo.softDelete).toHaveBeenCalledWith(db, reviewId);
    });
  });
});
