import { Elysia } from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service
vi.mock("./reviews.service", () => ({
  reviewsService: {
    createProductReview: vi.fn(),
    createWinemakerReview: vi.fn(),
    deleteReview: vi.fn(),
    listProductReviews: vi.fn(),
    listWinemakerReviews: vi.fn(),
  },
}));

// Use a simple parent app that provides context instead of mocking authPlugin globally
import { reviewsRoutes } from "./reviews.routes";
import { reviewsService } from "./reviews.service";

describe("reviews.routes integration", () => {
  let mockUser: any = { id: "u1" };

  const app = new Elysia()
    .derive(() => ({
      clerkPayload: { roles: ["user"], sub: "test" },
      dbUser: mockUser,
    }))
    .use(reviewsRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: "u1" };
  });

  describe("GET /reviews/product/:id", () => {
    it("returns product reviews", async () => {
      vi.mocked(reviewsService.listProductReviews).mockResolvedValue({
        averageRating: 5,
        reviews: [],
      });
      const res = await app.handle(new Request("http://localhost/reviews/product/p1"));
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /reviews/product/:id/:reviewId", () => {
    it("deletes product review", async () => {
      vi.mocked(reviewsService.deleteReview).mockResolvedValue(undefined);

      const res = await app.handle(
        new Request("http://localhost/reviews/product/p1/r1", {
          method: "DELETE",
        })
      );

      expect(res.status).toBe(200);
    });
  });
});
