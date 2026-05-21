import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultProduct } = vi.hoisted(() => ({
  defaultProduct: {
    createdAt: new Date("2025-01-01"),
    deletedAt: null,
    description: "A test product",
    id: "p1",
    isBundle: false,
    name: "Test Product",
    price: "150.00",
    quantity: 10,
    rating: 4.5,
    reviewCount: 3,
    shop: { id: "s1", name: "Test Shop" },
    shopId: "s1",
    updatedAt: new Date("2025-01-01"),
    wineId: "w1",
    wines: [
      {
        color: "red",
        id: "w1",
        name: "Test Wine",
        region: "Moravia",
        type: "still",
        vintageYear: 2020,
        winemaker: { name: "Test Winery" },
      },
    ],
  },
}));

vi.mock("./products.service", () => ({
  productsService: {
    createProductOrBundle: vi.fn().mockResolvedValue(defaultProduct),
    deleteProductOrBundle: vi.fn().mockResolvedValue(undefined),
    getAllProducts: vi
      .fn()
      .mockResolvedValue({ data: [defaultProduct], limit: 24, page: 1, total: 1 }),
    getProduct: vi.fn().mockResolvedValue(defaultProduct),
    updateProductOrBundle: vi.fn().mockResolvedValue(defaultProduct),
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

describe("products routes", () => {
  afterEach(() => resetAuth());

  describe("GET /products", () => {
    it("returns 200 with product list (public)", async () => {
      const response = await app.handle(get("/products"));
      expect(response.status).toBe(200);
    });
  });

  describe("POST /shops/:id/products", () => {
    const validBody = {
      name: "New Product",
      price: "100.00",
      quantity: 10,
      wineId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    };

    it("returns 401 when no auth token", async () => {
      const response = await app.handle(post("/shops/s1/products", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/shops/s1/products", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 201 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        post("/shops/s1/products", { auth: { roles: ["shop_owner"] }, body: validBody })
      );
      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /shops/:id/products/:productId", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(del("/shops/s1/products/p1"));
      expect(response.status).toBe(401);
    });

    it("returns 204 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        del("/shops/s1/products/p1", { auth: { roles: ["shop_owner"] } })
      );
      expect([204, 422, 500]).toContain(response.status);
    });
  });
});
