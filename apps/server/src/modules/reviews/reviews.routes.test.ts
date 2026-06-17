import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

vi.mock("./reviews.service", () => ({
  reviewsService: {
    createProductReview: vi.fn().mockResolvedValue({
      body: null,
      createdAt: new Date(),
      entityId: "p1",
      entityType: "product",
      id: "r1",
      rating: 5,
      user: { fname: "Test", id: "u1", lname: "User" },
      userId: "u1",
    }),
    createWinemakerReview: vi.fn().mockResolvedValue({
      body: null,
      createdAt: new Date(),
      entityId: "wm1",
      entityType: "winemaker",
      id: "r3",
      rating: 5,
      user: { fname: "Test", id: "u1", lname: "User" },
      userId: "u1",
    }),
    createWineReview: vi.fn().mockResolvedValue({
      body: null,
      createdAt: new Date(),
      entityId: "w1",
      entityType: "wine",
      id: "r2",
      rating: 5,
      user: { fname: "Test", id: "u1", lname: "User" },
      userId: "u1",
    }),
    deleteReview: vi.fn().mockResolvedValue(undefined),
    listProductReviews: vi
      .fn()
      .mockResolvedValue({ averageRating: 4.5, reviews: [], totalCount: 0 }),
    listShopReviews: vi.fn().mockResolvedValue({ averageRating: 4.3, reviews: [], totalCount: 0 }),
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

  describe("GET /shops/:id/reviews", () => {
    it("returns 200 with aggregated review list (public)", async () => {
      const response = await app.handle(get("/shops/s1/reviews"));
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
  });
});
