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

const mockUserState = {
  clerkId: "clerk-u1",
  clerkPayload: { roles: ["customer"], sub: "clerk-u1" },
  dbUser: { id: "u1", role: "customer" },
};

// Mock the auth module BEFORE importing reviewsRoutes
vi.mock("../auth", () => ({
  authPlugin: new (require("elysia").Elysia)({ name: "auth" }).macro({
    requireAuth: {
      resolve: () => mockUserState,
    },
    requireCapability: () => ({
      resolve: () => mockUserState,
    }),
    requireRoles: () => ({
      resolve: () => mockUserState,
    }),
  }),
}));

import { reviewsRoutes } from "./reviews.routes";
import { reviewsService } from "./reviews.service";

describe("reviews.routes integration", () => {
  const app = new Elysia().use(reviewsRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /products/:id/reviews returns 200", async () => {
    vi.mocked(reviewsService.listProductReviews).mockResolvedValue({
      averageRating: 4.5,
      reviews: [],
      totalCount: 0,
    });

    const res = await app.handle(new Request("http://localhost/products/p1/reviews"));
    expect(res.status).toBe(200);
  });

  it("POST /products/:id/reviews returns 200", async () => {
    vi.mocked(reviewsService.createProductReview).mockResolvedValue({ id: "r1" } as any);

    const res = await app.handle(
      new Request("http://localhost/products/p1/reviews", {
        body: JSON.stringify({ body: "test", rating: 5 }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
    );
    expect(res.status).toBe(200);
  });

  it("DELETE /reviews/:id returns 200", async () => {
    vi.mocked(reviewsService.deleteReview).mockResolvedValue(undefined);

    const res = await app.handle(
      new Request("http://localhost/reviews/r1?entityId=p1&entityType=product", {
        method: "DELETE",
      })
    );
    expect(res.status).toBe(200);
  });
});
