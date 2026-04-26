import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./reviews.repository", () => ({
  reviewsRepository: {
    findProductReviews: vi.fn(),
    findWinemakerReviews: vi.fn(),
    averageProductRating: vi.fn(),
    averageWinemakerRating: vi.fn(),
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

const userId = "11111111-1111-1111-1111-111111111111";
const otherUser = "22222222-2222-2222-2222-222222222222";
const productId = "33333333-3333-3333-3333-333333333333";
const winemakerId = "44444444-4444-4444-4444-444444444444";
const reviewId = "55555555-5555-5555-5555-555555555555";

const mockUser = { id: userId, fname: "Jan", lname: "Novak" };

const mockProductReview = {
  id: reviewId,
  userId,
  productId,
  rating: 4,
  body: "Great wine",
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  user: mockUser,
};

const mockWinemakerReview = {
  id: reviewId,
  userId,
  winemakerId,
  rating: 5,
  body: null,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  user: mockUser,
};

beforeEach(() => vi.clearAllMocks());

describe("listProductReviews", () => {
  it("returns reviews and averageRating together", async () => {
    vi.mocked(reviewsRepository.findProductReviews).mockResolvedValue([mockProductReview] as never);
    vi.mocked(reviewsRepository.averageProductRating).mockResolvedValue(4.0);

    const result = await reviewsService.listProductReviews(productId);

    expect(result.reviews).toEqual([mockProductReview]);
    expect(result.averageRating).toBe(4.0);
    expect(reviewsRepository.findProductReviews).toHaveBeenCalledWith(productId);
    expect(reviewsRepository.averageProductRating).toHaveBeenCalledWith(productId);
  });

  it("returns null averageRating when there are no reviews", async () => {
    vi.mocked(reviewsRepository.findProductReviews).mockResolvedValue([]);
    vi.mocked(reviewsRepository.averageProductRating).mockResolvedValue(null);

    const result = await reviewsService.listProductReviews(productId);

    expect(result.reviews).toEqual([]);
    expect(result.averageRating).toBeNull();
  });
});

describe("listWinemakerReviews", () => {
  it("returns reviews and averageRating together", async () => {
    vi.mocked(reviewsRepository.findWinemakerReviews).mockResolvedValue([
      mockWinemakerReview,
    ] as never);
    vi.mocked(reviewsRepository.averageWinemakerRating).mockResolvedValue(5.0);

    const result = await reviewsService.listWinemakerReviews(winemakerId);

    expect(result.reviews).toEqual([mockWinemakerReview]);
    expect(result.averageRating).toBe(5.0);
  });
});

describe("createProductReview", () => {
  it("creates review for verified purchaser with no prior review", async () => {
    vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true);
    vi.mocked(reviewsRepository.findProductReview).mockResolvedValue(undefined);
    vi.mocked(reviewsRepository.insertProductReview).mockResolvedValue(mockProductReview as never);
    vi.mocked(reviewsRepository.findProductReviewWithUser).mockResolvedValue(
      mockProductReview as never
    );

    const result = await reviewsService.createProductReview(userId, productId, {
      rating: 4,
      body: "Great wine",
    });

    expect(result).toEqual(mockProductReview);
    expect(reviewsRepository.insertProductReview).toHaveBeenCalledWith(userId, productId, {
      rating: 4,
      body: "Great wine",
    });
  });

  it("throws NOT_PURCHASED when user has not ordered the product", async () => {
    vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(false);

    await expect(
      reviewsService.createProductReview(userId, productId, { rating: 4 })
    ).rejects.toThrow("NOT_PURCHASED");

    expect(reviewsRepository.insertProductReview).not.toHaveBeenCalled();
  });

  it("throws DUPLICATE_REVIEW when user already reviewed this product", async () => {
    vi.mocked(reviewsRepository.hasPurchasedProduct).mockResolvedValue(true);
    vi.mocked(reviewsRepository.findProductReview).mockResolvedValue(mockProductReview as never);

    await expect(
      reviewsService.createProductReview(userId, productId, { rating: 4 })
    ).rejects.toThrow("DUPLICATE_REVIEW");

    expect(reviewsRepository.insertProductReview).not.toHaveBeenCalled();
  });
});

describe("createWinemakerReview", () => {
  it("creates review when no prior review exists", async () => {
    vi.mocked(reviewsRepository.findWinemakerReview).mockResolvedValue(undefined);
    vi.mocked(reviewsRepository.insertWinemakerReview).mockResolvedValue(
      mockWinemakerReview as never
    );
    vi.mocked(reviewsRepository.findWinemakerReviewWithUser).mockResolvedValue(
      mockWinemakerReview as never
    );

    const result = await reviewsService.createWinemakerReview(userId, winemakerId, { rating: 5 });

    expect(result).toEqual(mockWinemakerReview);
    expect(reviewsRepository.insertWinemakerReview).toHaveBeenCalledWith(userId, winemakerId, {
      rating: 5,
    });
  });

  it("throws DUPLICATE_REVIEW when user already reviewed this winemaker", async () => {
    vi.mocked(reviewsRepository.findWinemakerReview).mockResolvedValue(
      mockWinemakerReview as never
    );

    await expect(
      reviewsService.createWinemakerReview(userId, winemakerId, { rating: 5 })
    ).rejects.toThrow("DUPLICATE_REVIEW");

    expect(reviewsRepository.insertWinemakerReview).not.toHaveBeenCalled();
  });
});

describe("deleteProductReview", () => {
  it("allows owner to delete their own product review", async () => {
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(
      mockProductReview as never
    );

    await reviewsService.deleteProductReview(reviewId, productId, userId, ["user"]);

    expect(reviewsRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId);
  });

  it("allows admin to delete any product review regardless of ownership", async () => {
    const otherReview = { ...mockProductReview, userId: otherUser };
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(otherReview as never);

    await reviewsService.deleteProductReview(reviewId, productId, userId, ["admin"]);

    expect(reviewsRepository.softDeleteProductReview).toHaveBeenCalledWith(reviewId);
  });

  it("throws FORBIDDEN when non-owner tries to delete a product review", async () => {
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(
      mockProductReview as never
    );

    await expect(
      reviewsService.deleteProductReview(reviewId, productId, otherUser, ["user"])
    ).rejects.toThrow("FORBIDDEN");

    expect(reviewsRepository.softDeleteProductReview).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when product review does not exist or belongs to a different product", async () => {
    vi.mocked(reviewsRepository.findProductReviewById).mockResolvedValue(undefined);

    await expect(
      reviewsService.deleteProductReview(reviewId, productId, userId, ["user"])
    ).rejects.toThrow("NOT_FOUND");
  });
});

describe("deleteWinemakerReview", () => {
  it("allows owner to delete their own winemaker review", async () => {
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(
      mockWinemakerReview as never
    );

    await reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, ["user"]);

    expect(reviewsRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId);
  });

  it("allows admin to delete any winemaker review regardless of ownership", async () => {
    const otherReview = { ...mockWinemakerReview, userId: otherUser };
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(otherReview as never);

    await reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, ["admin"]);

    expect(reviewsRepository.softDeleteWinemakerReview).toHaveBeenCalledWith(reviewId);
  });

  it("throws FORBIDDEN when non-owner tries to delete a winemaker review", async () => {
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(
      mockWinemakerReview as never
    );

    await expect(
      reviewsService.deleteWinemakerReview(reviewId, winemakerId, otherUser, ["user"])
    ).rejects.toThrow("FORBIDDEN");

    expect(reviewsRepository.softDeleteWinemakerReview).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when winemaker review does not exist or belongs to a different winemaker", async () => {
    vi.mocked(reviewsRepository.findWinemakerReviewById).mockResolvedValue(undefined);

    await expect(
      reviewsService.deleteWinemakerReview(reviewId, winemakerId, userId, ["user"])
    ).rejects.toThrow("NOT_FOUND");
  });
});
