import type { Elysia } from "elysia";
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

import { createReviewsRoutes } from "./reviews.routes";
import { reviewsService } from "./reviews.service";

describe("reviews.routes integration", () => {
  const mockAuthState = {
    clerkPayload: { roles: ["customer"], sub: "test" },
    dbUser: {
      deletedAt: null,
      email: "user@test.com",
      fname: "Test",
      id: "u1",
      lname: "User",
      role: "customer",
      status: "active",
      updatedAt: null,
    },
  };

  const mockAuthPlugin = (app: Elysia) =>
    app
      .derive(() => mockAuthState)
      .macro(
        () =>
          ({
            requireAuth: () => ({}),
            requireRoles: () => ({}),
          }) as any
      );

  const app = createReviewsRoutes(mockAuthPlugin as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /reviews/product/:id returns 200 with totalCount and calls service with defaults", async () => {
    vi.mocked(reviewsService.listProductReviews).mockResolvedValue({
      averageRating: 4.5,
      reviews: [],
      totalCount: 0,
    });

    const res = await app.handle(new Request("http://localhost/reviews/product/p1"));

    expect(res.status).toBe(200);
    const body = (await res.json()) as { totalCount: number };
    expect(body.totalCount).toBe(0);
    expect(reviewsService.listProductReviews).toHaveBeenCalledWith("p1", {
      limit: 12,
      page: 1,
      sort: "newest",
    });
  });

  it("GET /reviews/winemaker/:id returns 200 with totalCount and custom params", async () => {
    vi.mocked(reviewsService.listWinemakerReviews).mockResolvedValue({
      averageRating: 3.0,
      reviews: [],
      totalCount: 5,
    });

    const res = await app.handle(
      new Request("http://localhost/reviews/winemaker/w1?page=2&limit=5&sort=highest")
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { totalCount: number };
    expect(body.totalCount).toBe(5);
    expect(reviewsService.listWinemakerReviews).toHaveBeenCalledWith("w1", {
      limit: 5,
      page: 2,
      sort: "highest",
    });
  });

  it("POST /reviews/product/:id returns 200", async () => {
    const mockFullReview = {
      body: "test",
      createdAt: new Date().toISOString(),
      deletedAt: null,
      entityId: "p1",
      entityType: "product",
      id: "r1",
      rating: 5,
      updatedAt: null,
      user: { fname: "Test", id: "u1", lname: "User" },
      userId: "u1",
    };

    vi.mocked(reviewsService.createProductReview).mockResolvedValue(mockFullReview as any);

    const res = await app.handle(
      new Request("http://localhost/reviews/product/p1", {
        body: JSON.stringify({ body: "test", rating: 5 }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
    );

    expect(res.status).toBe(200);
  });

  it("DELETE /reviews/product/:id/:reviewId returns 200", async () => {
    vi.mocked(reviewsService.deleteReview).mockResolvedValue(undefined);

    const res = await app.handle(
      new Request("http://localhost/reviews/product/p1/r1", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(200);
  });
});
