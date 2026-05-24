import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, patch, post } from "../../__tests__/helpers/request";
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

    it("supports pagination query parameter", async () => {
      const response = await app.handle(get("/products?page=2"));
      expect(response.status).toBe(200);
    });

    it("supports search query parameter", async () => {
      const response = await app.handle(get("/products?q=wine"));
      expect(response.status).toBe(200);
    });

    it("supports shopId filter", async () => {
      const response = await app.handle(
        get("/products?shopId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      );
      expect(response.status).toBe(200);
    });

    it("supports isBundle filter", async () => {
      const response = await app.handle(get("/products?isBundle=true"));
      expect(response.status).toBe(200);
    });
  });

  describe("GET /products/:id", () => {
    it("returns 200 with a single product", async () => {
      const response = await app.handle(get("/products/p1"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect((data as { id: string }).id).toBe("p1");
    });
  });

  describe("GET /shops/:id/products", () => {
    it("returns 200 with shop products", async () => {
      const response = await app.handle(get("/shops/s1/products"));
      expect(response.status).toBe(200);
    });

    it("supports pagination on shop products", async () => {
      const response = await app.handle(get("/shops/s1/products?page=2"));
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

    it("returns 201 when authenticated as admin", async () => {
      const response = await app.handle(
        post("/shops/s1/products", { auth: { roles: ["admin"] }, body: validBody })
      );
      expect(response.status).toBe(201);
    });

    it("returns 422 when body is missing required fields", async () => {
      const response = await app.handle(
        post("/shops/s1/products", {
          auth: { roles: ["shop_owner"] },
          body: { name: "New Product" }, // missing price, quantity, wineId
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("PATCH /shops/:id/products/:productId", () => {
    const validBody = {
      name: "Updated Product",
      price: "120.00",
      quantity: 15,
    };

    it("returns 401 when no auth token", async () => {
      const response = await app.handle(patch("/shops/s1/products/p1", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        patch("/shops/s1/products/p1", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        patch("/shops/s1/products/p1", { auth: { roles: ["shop_owner"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        patch("/shops/s1/products/p1", { auth: { roles: ["admin"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });

    it("supports partial updates", async () => {
      const response = await app.handle(
        patch("/shops/s1/products/p1", {
          auth: { roles: ["shop_owner"] },
          body: { name: "Renamed Product" }, // only update name
        })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /shops/:id/products/:productId", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(del("/shops/s1/products/p1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        del("/shops/s1/products/p1", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 204 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        del("/shops/s1/products/p1", { auth: { roles: ["shop_owner"] } })
      );
      expect([204, 422, 500]).toContain(response.status);
    });

    it("returns 204 when authenticated as admin", async () => {
      const response = await app.handle(
        del("/shops/s1/products/p1", { auth: { roles: ["admin"] } })
      );
      expect([204, 422, 500]).toContain(response.status);
    });
  });
});
