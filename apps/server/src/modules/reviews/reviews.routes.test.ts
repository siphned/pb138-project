import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./reviews.service", () => ({
  reviewsService: {
    createProductReview: vi.fn(),
    createWinemakerReview: vi.fn(),
    deleteProductReview: vi.fn(),
    deleteWinemakerReview: vi.fn(),
    listProductReviews: vi.fn(),
    listWinemakerReviews: vi.fn(),
  },
}));

vi.mock("../../utils/auth", () => ({
  authPlugin: {
    macro: () => ({}),
  },
}));

import { reviewsService } from "./reviews.service";

describe("reviewsService method signatures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listProductReviews is callable with a productId", async () => {
    vi.mocked(reviewsService.listProductReviews).mockResolvedValue({
      averageRating: 4.5,
      reviews: [],
    });

    const result = await reviewsService.listProductReviews("p1");
    expect(result.averageRating).toBe(4.5);
  });

  it("createProductReview is callable with userId, productId, data", async () => {
    vi.mocked(reviewsService.createProductReview).mockResolvedValue({ id: "r1" } as never);

    const result = await reviewsService.createProductReview("u1", "p1", { rating: 5 });
    expect(result.id).toBe("r1");
  });

  it("deleteProductReview is callable with reviewId, productId, userId, role", async () => {
    vi.mocked(reviewsService.deleteProductReview).mockResolvedValue(undefined);

    await reviewsService.deleteProductReview("r1", "p1", "u1", "customer");
    expect(reviewsService.deleteProductReview).toHaveBeenCalledWith("r1", "p1", "u1", "customer");
  });
});
