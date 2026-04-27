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
