import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./products.service", () => ({
  productsService: {
    createProductOrBundle: vi.fn(),
    deleteProductOrBundle: vi.fn(),
    getAllProducts: vi.fn(),
    getProduct: vi.fn(),
    updateProductOrBundle: vi.fn(),
  },
}));

import { productsRoutes } from "./products.routes";
import { productsService } from "./products.service";

describe("products.routes integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /products with wineId filter calls service correctly", async () => {
    vi.mocked(productsService.getAllProducts).mockResolvedValue({
      data: [],
      limit: 20,
      page: 1,
      total: 0,
    });

    const wineId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const res = await productsRoutes.handle(
      new Request(`http://localhost/products?wineId=${wineId}`)
    );

    expect(res.status).toBe(200);
    expect(productsService.getAllProducts).toHaveBeenCalledWith(
      expect.objectContaining({ wineId })
    );
  });

  it("GET /products with q filter calls service correctly", async () => {
    vi.mocked(productsService.getAllProducts).mockResolvedValue({
      data: [],
      limit: 20,
      page: 1,
      total: 0,
    });

    const res = await productsRoutes.handle(new Request("http://localhost/products?q=pinot"));

    expect(res.status).toBe(200);
    expect(productsService.getAllProducts).toHaveBeenCalledWith(
      expect.objectContaining({ q: "pinot" })
    );
  });

  it("GET /products with shopId filter calls service correctly", async () => {
    vi.mocked(productsService.getAllProducts).mockResolvedValue({
      data: [],
      limit: 20,
      page: 1,
      total: 0,
    });

    const shopId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    const res = await productsRoutes.handle(
      new Request(`http://localhost/products?shopId=${shopId}`)
    );

    expect(res.status).toBe(200);
    expect(productsService.getAllProducts).toHaveBeenCalledWith(
      expect.objectContaining({ shopId })
    );
  });

  it("GET /products with isBundle=true passes boolean to service", async () => {
    vi.mocked(productsService.getAllProducts).mockResolvedValue({
      data: [],
      limit: 20,
      page: 1,
      total: 0,
    });

    const res = await productsRoutes.handle(new Request("http://localhost/products?isBundle=true"));

    expect(res.status).toBe(200);
    expect(productsService.getAllProducts).toHaveBeenCalledWith(
      expect.objectContaining({ isBundle: true })
    );
  });
});
