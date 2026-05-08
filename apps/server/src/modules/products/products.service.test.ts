import { beforeEach, describe, expect, it, vi } from "vitest";
import * as shopsRepo from "../shops/shops.repository";
import * as productsRepo from "./products.repository";
import { productsService } from "./products.service";

vi.mock("./products.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./products.repository")>();
  return {
    ...actual,
    create: vi.fn(),
    createProductWines: vi.fn(),
    findById: vi.fn(),
    getWineQuantityForUpdate: vi.fn(),
    updateWineQuantity: vi.fn(),
    winesExist: vi.fn(),
  };
});

vi.mock("../shops/shops.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../shops/shops.repository")>();
  return { ...actual, findById: vi.fn() };
});

vi.mock("../../db", () => {
  const m = {
    transaction: vi.fn((cb) => cb(m)),
  };
  return { db: m };
});

describe("productsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const shopId = "s1";
  const requesterId = "u1";
  const productId = "p1";

  describe("createProduct", () => {
    it("creates a simple product when winemaker owns the wine", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ ownerUserId: requesterId } as any);
      vi.mocked(productsRepo.winesExist).mockResolvedValue(true);
      vi.mocked(productsRepo.getWineQuantityForUpdate).mockResolvedValue(100);
      vi.mocked(productsRepo.create).mockResolvedValue({ id: productId } as any);

      const result = await productsService.createProduct(shopId, requesterId, {
        description: "Desc",
        name: "Wine",
        price: "100",
        quantity: 10,
        wineId: "w1",
      });

      expect(result.id).toBe(productId);
      expect(productsRepo.create).toHaveBeenCalled();
    });
  });
});
