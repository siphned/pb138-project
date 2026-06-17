import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as reviewsRepo from "./reviews.repository";
import { reviewsService } from "./reviews.service";

vi.mock("./reviews.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./reviews.repository")>();
  return {
    ...actual,
    averageRating: vi.fn(),
    averageShopRating: vi.fn(),
    countReviews: vi.fn(),
    countShopReviews: vi.fn(),
    findById: vi.fn(),
    findReviews: vi.fn(),
    findReviewWithUser: vi.fn(),
    findShopReviews: vi.fn(),
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

  describe("listShopReviews", () => {
    it("aggregates reviews, totalCount, and averageRating across the shop's products", async () => {
      const shopId = "s1";
      const mockReviews = [{ id: "r3" }];
      vi.mocked(reviewsRepo.findShopReviews).mockResolvedValue(mockReviews as any);
      vi.mocked(reviewsRepo.averageShopRating).mockResolvedValue(4.2);
      vi.mocked(reviewsRepo.countShopReviews).mockResolvedValue(15);

      const result = await reviewsService.listShopReviews(shopId, {
        limit: 10,
        page: 2,
        sort: "lowest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(4.2);
      expect(result.totalCount).toBe(15);
      expect(reviewsRepo.findShopReviews).toHaveBeenCalledWith(db, shopId, {
        limit: 10,
        offset: 10,
        sort: "lowest",
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

    it("throws NOT_PURCHASED if user hasn't purchased the product", async () => {
      vi.mocked(reviewsRepo.hasPurchasedProduct).mockResolvedValue(false);

      await expect(
        reviewsService.createProductReview(userId, productId, { rating: 5 })
      ).rejects.toThrow("NOT_PURCHASED");
    });

    it("throws ALREADY_REVIEWED if user already has a review", async () => {
      vi.mocked(reviewsRepo.hasPurchasedProduct).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue({ id: "existing-review" } as any);

      await expect(
        reviewsService.createProductReview(userId, productId, { rating: 5 })
      ).rejects.toThrow("ALREADY_REVIEWED");
    });

    it("allows review with optional body text", async () => {
      vi.mocked(reviewsRepo.hasPurchasedProduct).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepo.insertReview).mockResolvedValue({ id: reviewId } as any);
      vi.mocked(reviewsRepo.findReviewWithUser).mockResolvedValue({ id: reviewId } as any);

      const result = await reviewsService.createProductReview(userId, productId, {
        body: "Great wine!",
        rating: 4,
      });

      expect(result.id).toBe(reviewId);
      expect(reviewsRepo.insertReview).toHaveBeenCalledWith(db, userId, productId, "product", {
        body: "Great wine!",
        rating: 4,
      });
    });
  });

  describe("createWinemakerReview", () => {
    it("throws ForbiddenError when user has no qualifying purchase", async () => {
      vi.mocked(reviewsRepo.hasPurchasedFromWinemaker).mockResolvedValue(false);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);

      await expect(
        reviewsService.createWinemakerReview(userId, winemakerId, { rating: 4 })
      ).rejects.toMatchObject({ code: "NOT_PURCHASED", statusCode: 400 });
    });

    it("throws BadRequestError when user already reviewed this winemaker", async () => {
      vi.mocked(reviewsRepo.hasPurchasedFromWinemaker).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue({ id: reviewId } as any);

      await expect(
        reviewsService.createWinemakerReview(userId, winemakerId, { rating: 4 })
      ).rejects.toMatchObject({ code: "ALREADY_REVIEWED", statusCode: 409 });
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

  describe("createWineReview", () => {
    const wineId = "wine-1";

    it("creates review for verified wine purchaser", async () => {
      vi.mocked(reviewsRepo.hasPurchasedWine).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepo.insertReview).mockResolvedValue({ id: reviewId } as any);
      vi.mocked(reviewsRepo.findReviewWithUser).mockResolvedValue({ id: reviewId } as any);

      const result = await reviewsService.createWineReview(userId, wineId, { rating: 5 });

      expect(result.id).toBe(reviewId);
      expect(reviewsRepo.insertReview).toHaveBeenCalledWith(db, userId, wineId, "wine", {
        rating: 5,
      });
    });

    it("throws NOT_PURCHASED if user hasn't purchased the wine", async () => {
      vi.mocked(reviewsRepo.hasPurchasedWine).mockResolvedValue(false);

      await expect(reviewsService.createWineReview(userId, wineId, { rating: 5 })).rejects.toThrow(
        "NOT_PURCHASED"
      );
    });

    it("throws ALREADY_REVIEWED if user already reviewed the wine", async () => {
      vi.mocked(reviewsRepo.hasPurchasedWine).mockResolvedValue(true);
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue({ id: "existing-review" } as any);

      await expect(reviewsService.createWineReview(userId, wineId, { rating: 5 })).rejects.toThrow(
        "ALREADY_REVIEWED"
      );
    });
  });

  describe("deleteReview", () => {
    it("allows owner to delete their own review", async () => {
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue({ id: reviewId } as any);

      await reviewsService.deleteReview(reviewId, userId, "user", productId, "product");

      expect(reviewsRepo.softDelete).toHaveBeenCalledWith(db, reviewId);
    });

    it("throws NOT_FOUND if review doesn't exist", async () => {
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);

      await expect(
        reviewsService.deleteReview(reviewId, userId, "user", productId, "product")
      ).rejects.toThrow("NOT_FOUND");
    });

    it("allows admin to delete any review", async () => {
      vi.mocked(reviewsRepo.findUserReview).mockResolvedValue(undefined);
      vi.mocked(reviewsRepo.findById).mockResolvedValue({ id: reviewId } as any);

      await reviewsService.deleteReview(reviewId, "other-user", "admin", productId, "product");

      expect(reviewsRepo.softDelete).toHaveBeenCalledWith(db, reviewId);
    });
  });

  describe("listWineReviews", () => {
    const wineId = "wine-1";

    it("returns reviews with pagination and sorting", async () => {
      const mockReviews = [{ id: "r1" }];
      vi.mocked(reviewsRepo.findReviews).mockResolvedValue(mockReviews as any);
      vi.mocked(reviewsRepo.averageRating).mockResolvedValue(4.2);
      vi.mocked(reviewsRepo.countReviews).mockResolvedValue(15);

      const result = await reviewsService.listWineReviews(wineId, {
        limit: 10,
        page: 1,
        sort: "newest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(result.averageRating).toBe(4.2);
      expect(result.totalCount).toBe(15);
      expect(reviewsRepo.findReviews).toHaveBeenCalledWith(db, wineId, "wine", {
        limit: 10,
        offset: 0,
        sort: "newest",
      });
    });

    it("supports highest rated sorting", async () => {
      const mockReviews = [{ id: "r1", rating: 5 }];
      vi.mocked(reviewsRepo.findReviews).mockResolvedValue(mockReviews as any);
      vi.mocked(reviewsRepo.averageRating).mockResolvedValue(4.8);
      vi.mocked(reviewsRepo.countReviews).mockResolvedValue(8);

      const result = await reviewsService.listWineReviews(wineId, {
        limit: 10,
        page: 1,
        sort: "highest",
      });

      expect(result.reviews).toBe(mockReviews);
      expect(reviewsRepo.findReviews).toHaveBeenCalledWith(db, wineId, "wine", {
        limit: 10,
        offset: 0,
        sort: "highest",
      });
    });

    it("supports lowest rated sorting", async () => {
      const mockReviews = [{ id: "r1", rating: 1 }];
      vi.mocked(reviewsRepo.findReviews).mockResolvedValue(mockReviews as any);
      vi.mocked(reviewsRepo.averageRating).mockResolvedValue(2.5);
      vi.mocked(reviewsRepo.countReviews).mockResolvedValue(5);

      await reviewsService.listWineReviews(wineId, {
        limit: 10,
        page: 2,
        sort: "lowest",
      });

      expect(reviewsRepo.findReviews).toHaveBeenCalledWith(db, wineId, "wine", {
        limit: 10,
        offset: 10,
        sort: "lowest",
      });
    });
  });
});
