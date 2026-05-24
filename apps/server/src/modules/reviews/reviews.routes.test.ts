<<<<<<< HEAD
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

vi.mock("./reviews.service", () => ({
  reviewsService: {
    createProductReview: vi.fn().mockResolvedValue({ id: "r1" }),
    createWinemakerReview: vi.fn().mockResolvedValue({ id: "r3" }),
    createWineReview: vi.fn().mockResolvedValue({ id: "r2" }),
    deleteReview: vi.fn().mockResolvedValue(undefined),
    listProductReviews: vi
      .fn()
      .mockResolvedValue({ averageRating: 4.5, reviews: [], totalCount: 0 }),
    listWinemakerReviews: vi
      .fn()
      .mockResolvedValue({ averageRating: 4.2, reviews: [], totalCount: 0 }),
    listWineReviews: vi.fn().mockResolvedValue({ averageRating: 4.0, reviews: [], totalCount: 0 }),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }) },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("../carts/carts.service", () => ({
  cartsService: { mergeOnLogin: vi.fn().mockResolvedValue(undefined) },
}));

describe("reviews routes", () => {
  afterEach(() => resetAuth());

  describe("GET /products/:id/reviews", () => {
    it("returns 200 with review list (public)", async () => {
      const response = await app.handle(get("/products/p1/reviews"));
      expect(response.status).toBe(200);
    });
  });

  describe("POST /products/:id/reviews", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(post("/products/p1/reviews", { body: { rating: 5 } }));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated", async () => {
      const response = await app.handle(
        post("/products/p1/reviews", { auth: { roles: ["customer"] }, body: { rating: 5 } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /wines/:id/reviews", () => {
    it("returns 200 with review list (public)", async () => {
      const response = await app.handle(get("/wines/w1/reviews"));
      expect(response.status).toBe(200);
    });
  });

  describe("GET /winemakers/:id/reviews", () => {
    it("returns 200 with review list (public)", async () => {
      const response = await app.handle(get("/winemakers/wm1/reviews"));
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /reviews/:id", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(
        del("/reviews/r1", { query: { entityId: "p1", entityType: "product" } })
      );
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated", async () => {
      const response = await app.handle(
        del("/reviews/r1", {
          auth: { roles: ["customer"] },
          query: { entityId: "p1", entityType: "product" },
        })
      );
      expect(response.status).toBe(200);
    });
=======
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
>>>>>>> origin/main
  });
});
