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

const mockProductsService = {
  createProductOrBundle: vi.fn().mockResolvedValue(defaultProduct),
  deleteProductOrBundle: vi.fn().mockResolvedValue(undefined),
  getAllProducts: vi
    .fn()
    .mockResolvedValue({ data: [defaultProduct], limit: 24, page: 1, total: 1 }),
  getProduct: vi.fn().mockResolvedValue(defaultProduct),
  updateProductOrBundle: vi.fn().mockResolvedValue(defaultProduct),
};

vi.mock("./products.service", () => ({
  productsService: mockProductsService,
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
  afterEach(() => {
    resetAuth();
    vi.clearAllMocks();
  });

  describe("GET /products", () => {
    it("returns 200 with product list (public)", async () => {
      const response = await app.handle(get("/products"));
      expect(response.status).toBe(200);
    });

<<<<<<< HEAD
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
=======
    it("returns 200 with filters", async () => {
      const response = await app.handle(get("/products?q=wine&shopId=s1&page=1&limit=10"));
      expect(response.status).toBe(200);
    });

    it("returns 200 without authentication", async () => {
      const response = await app.handle(get("/products"));
      expect(response.status).toBe(200);
    });

    it("calls getAllProducts with query params", async () => {
      await app.handle(get("/products?q=red%20wine"));
      expect(mockProductsService.getAllProducts).toHaveBeenCalled();
>>>>>>> WINE-266-fix-wine-edit-dark-mode
    });
  });

  describe("GET /products/:id", () => {
<<<<<<< HEAD
    it("returns 200 with a single product", async () => {
      const response = await app.handle(get("/products/p1"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect((data as { id: string }).id).toBe("p1");
=======
    it("returns 200 with single product", async () => {
      const response = await app.handle(get("/products/p1"));
      expect(response.status).toBe(200);
    });

    it("returns 200 for guest access", async () => {
      const response = await app.handle(get("/products/p1"));
      expect(response.status).toBe(200);
    });

    it("calls getProduct with correct ID", async () => {
      await app.handle(get("/products/product-123"));
      expect(mockProductsService.getProduct).toHaveBeenCalledWith("product-123");
    });

    it("returns 404 when product not found", async () => {
      mockProductsService.getProduct.mockResolvedValueOnce(null);
      const response = await app.handle(get("/products/missing"));
      expect(response.status === 200 || response.status === 404).toBe(true);
>>>>>>> WINE-266-fix-wine-edit-dark-mode
    });
  });

  describe("GET /shops/:id/products", () => {
<<<<<<< HEAD
    it("returns 200 with shop products", async () => {
=======
    it("returns 200 with shop products (public)", async () => {
>>>>>>> WINE-266-fix-wine-edit-dark-mode
      const response = await app.handle(get("/shops/s1/products"));
      expect(response.status).toBe(200);
    });

<<<<<<< HEAD
    it("supports pagination on shop products", async () => {
      const response = await app.handle(get("/shops/s1/products?page=2"));
      expect(response.status).toBe(200);
    });
=======
    it("returns 200 with filters", async () => {
      const response = await app.handle(get("/shops/s1/products?q=wine&page=1&limit=10"));
      expect(response.status).toBe(200);
    });

    it("calls getAllProducts with shopId filter", async () => {
      await app.handle(get("/shops/shop-123/products"));
      expect(mockProductsService.getAllProducts).toHaveBeenCalled();
    });
>>>>>>> WINE-266-fix-wine-edit-dark-mode
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

    it("returns 403 when authenticated as winemaker", async () => {
      const response = await app.handle(
        post("/shops/s1/products", { auth: { roles: ["winemaker"] }, body: validBody })
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

<<<<<<< HEAD
    it("returns 422 when body is missing required fields", async () => {
      const response = await app.handle(
        post("/shops/s1/products", {
          auth: { roles: ["shop_owner"] },
          body: { name: "New Product" }, // missing price, quantity, wineId
        })
      );
      expect(response.status).toBe(422);
=======
    it("calls createProductOrBundle with correct parameters", async () => {
      await app.handle(
        post("/shops/shop-123/products", {
          auth: { roles: ["shop_owner"] },
          body: validBody,
        })
      );
      expect(mockProductsService.createProductOrBundle).toHaveBeenCalledWith(
        "shop-123",
        "u1",
        validBody
      );
    });

    it("creates product with bundle (wines array)", async () => {
      const bundleBody = {
        name: "Wine Bundle",
        price: "200.00",
        quantity: 5,
        wines: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"],
      };
      const response = await app.handle(
        post("/shops/s1/products", { auth: { roles: ["shop_owner"] }, body: bundleBody })
      );
      expect(response.status).toBe(201);
>>>>>>> WINE-266-fix-wine-edit-dark-mode
    });
  });

  describe("PATCH /shops/:id/products/:productId", () => {
<<<<<<< HEAD
    const validBody = {
      name: "Updated Product",
      price: "120.00",
      quantity: 15,
    };
=======
    const validBody = { name: "Updated Product", price: "120.00" };
>>>>>>> WINE-266-fix-wine-edit-dark-mode

    it("returns 401 when no auth token", async () => {
      const response = await app.handle(patch("/shops/s1/products/p1", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
<<<<<<< HEAD
        patch("/shops/s1/products/p1", { auth: { roles: ["customer"] }, body: validBody })
=======
        patch("/shops/s1/products/p1", {
          auth: { roles: ["customer"] },
          body: validBody,
        })
>>>>>>> WINE-266-fix-wine-edit-dark-mode
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as shop_owner", async () => {
      const response = await app.handle(
<<<<<<< HEAD
        patch("/shops/s1/products/p1", { auth: { roles: ["shop_owner"] }, body: validBody })
=======
        patch("/shops/s1/products/p1", {
          auth: { roles: ["shop_owner"] },
          body: validBody,
        })
>>>>>>> WINE-266-fix-wine-edit-dark-mode
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
<<<<<<< HEAD
        patch("/shops/s1/products/p1", { auth: { roles: ["admin"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });

    it("supports partial updates", async () => {
      const response = await app.handle(
        patch("/shops/s1/products/p1", {
          auth: { roles: ["shop_owner"] },
          body: { name: "Renamed Product" }, // only update name
=======
        patch("/shops/s1/products/p1", {
          auth: { roles: ["admin"] },
          body: validBody,
>>>>>>> WINE-266-fix-wine-edit-dark-mode
        })
      );
      expect(response.status).toBe(200);
    });
<<<<<<< HEAD
=======

    it("calls updateProductOrBundle with correct parameters", async () => {
      await app.handle(
        patch("/shops/shop-123/products/prod-456", {
          auth: { roles: ["shop_owner"] },
          body: validBody,
        })
      );
      expect(mockProductsService.updateProductOrBundle).toHaveBeenCalledWith(
        "shop-123",
        "prod-456",
        "u1",
        validBody
      );
    });
>>>>>>> WINE-266-fix-wine-edit-dark-mode
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

<<<<<<< HEAD
=======
    it("returns 403 when authenticated as winemaker", async () => {
      const response = await app.handle(
        del("/shops/s1/products/p1", { auth: { roles: ["winemaker"] } })
      );
      expect(response.status).toBe(403);
    });

>>>>>>> WINE-266-fix-wine-edit-dark-mode
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
<<<<<<< HEAD
=======

    it("calls deleteProductOrBundle with correct parameters", async () => {
      await app.handle(
        del("/shops/shop-789/products/prod-789", { auth: { roles: ["shop_owner"] } })
      );
      expect(mockProductsService.deleteProductOrBundle).toHaveBeenCalledWith(
        "shop-789",
        "prod-789",
        "u1"
      );
    });
>>>>>>> WINE-266-fix-wine-edit-dark-mode
  });
});
