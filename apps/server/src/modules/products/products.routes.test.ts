import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service
vi.mock("./products.service", () => ({
  productsService: {
    getAllProducts: vi.fn(),
    getProduct: vi.fn(),
    listProducts: vi.fn(),
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
});
