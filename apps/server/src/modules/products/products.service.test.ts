import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import * as shopsRepo from "../shops/shops.repository";
import { ProductNotFoundError } from "./products.errors";
import * as productsRepo from "./products.repository";
import { productsService } from "./products.service";

vi.mock("./products.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./products.repository")>();
  return {
    ...actual,
    create: vi.fn(),
    createProductWines: vi.fn(),
    deleteProductWines: vi.fn(),
    findById: vi.fn(),
    getWineQuantityForUpdate: vi.fn(),
    update: vi.fn(),
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

  describe("createProductOrBundle", () => {
    it("creates a single product when wineId is present", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ ownerUserId: requesterId } as any);
      vi.mocked(productsRepo.winesExist).mockResolvedValue(true);
      vi.mocked(productsRepo.getWineQuantityForUpdate).mockResolvedValue(100);
      vi.mocked(productsRepo.create).mockResolvedValue({ id: productId, isBundle: false } as any);

      const result = await productsService.createProductOrBundle(shopId, requesterId, {
        name: "Pinot Noir",
        price: "15.99",
        quantity: 5,
        wineId: "w1",
      });

      expect(result.isBundle).toBe(false);
      expect(productsRepo.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ isBundle: false })
      );
    });

    it("creates a bundle when wines array is present", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ ownerUserId: requesterId } as any);
      vi.mocked(productsRepo.winesExist).mockResolvedValue(true);
      vi.mocked(productsRepo.getWineQuantityForUpdate).mockResolvedValue(100);
      vi.mocked(productsRepo.create).mockResolvedValue({ id: productId, isBundle: true } as any);

      const result = await productsService.createProductOrBundle(shopId, requesterId, {
        name: "Red Bundle",
        price: "29.99",
        quantity: 3,
        wines: [
          { quantity: 2, wineId: "w1" },
          { quantity: 1, wineId: "w2" },
        ],
      });

      expect(result.isBundle).toBe(true);
      expect(productsRepo.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ isBundle: true })
      );
    });
  });

  describe("deleteProductOrBundle", () => {
    it("soft-deletes a non-bundle product", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ ownerUserId: requesterId } as any);
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: productId,
        isBundle: false,
        productWines: [{ quantity: 1, wineId: "w1" }],
        quantity: 5,
        shopId,
      } as any);
      vi.mocked(productsRepo.update).mockResolvedValue({ id: productId } as any);

      await productsService.deleteProductOrBundle(shopId, productId, requesterId);

      expect(productsRepo.update).toHaveBeenCalledWith(
        expect.anything(),
        productId,
        expect.objectContaining({ deletedAt: expect.any(Date) })
      );
    });

    it("soft-deletes a bundle product", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ ownerUserId: requesterId } as any);
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: productId,
        isBundle: true,
        productWines: [
          { quantity: 3, wineId: "w1" },
          { quantity: 1, wineId: "w2" },
        ],
        quantity: 2,
        shopId,
      } as any);
      vi.mocked(productsRepo.update).mockResolvedValue({ id: productId } as any);

      await productsService.deleteProductOrBundle(shopId, productId, requesterId);

      expect(productsRepo.update).toHaveBeenCalledWith(
        expect.anything(),
        productId,
        expect.objectContaining({ deletedAt: expect.any(Date) })
      );
    });

    it("throws ProductNotFoundError when product belongs to a different shop", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ ownerUserId: requesterId } as any);
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: productId,
        isBundle: false,
        productWines: [],
        quantity: 1,
        shopId: "other-shop",
      } as any);

      await expect(
        productsService.deleteProductOrBundle(shopId, productId, requesterId)
      ).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe("updateProductOrBundle", () => {
    it("throws CONFLICTING_UPDATE_FIELDS when both wineId and wines are supplied", async () => {
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: productId,
        isBundle: false,
        productWines: [{ quantity: 1, wineId: "w1" }],
        quantity: 5,
        shopId,
      } as any);

      await expect(
        productsService.updateProductOrBundle(shopId, productId, requesterId, {
          wineId: "w1",
          wines: [
            { quantity: 2, wineId: "w1" },
            { quantity: 1, wineId: "w2" },
          ],
        })
      ).rejects.toMatchObject({ code: "CONFLICTING_UPDATE_FIELDS" });
    });

    it("throws NOT_A_BUNDLE when wines supplied on a non-bundle product", async () => {
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: productId,
        isBundle: false,
        productWines: [{ quantity: 1, wineId: "w1" }],
        quantity: 5,
        shopId,
      } as any);

      await expect(
        productsService.updateProductOrBundle(shopId, productId, requesterId, {
          wines: [
            { quantity: 2, wineId: "w1" },
            { quantity: 1, wineId: "w2" },
          ],
        })
      ).rejects.toMatchObject({ code: "NOT_A_BUNDLE" });
    });

    it("throws ProductNotFoundError when product belongs to a different shop", async () => {
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: productId,
        isBundle: false,
        productWines: [],
        quantity: 5,
        shopId: "other-shop",
      } as any);

      await expect(
        productsService.updateProductOrBundle(shopId, productId, requesterId, { name: "New Name" })
      ).rejects.toThrow(ProductNotFoundError);
    });
=======

vi.mock("../shops/shops.repository", () => ({
  shopsRepository: {
    createShopWithAddress: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByOwnerUserId: vi.fn(),
    insertAddress: vi.fn(),
    updateById: vi.fn(),
  },
}));

vi.mock("./products.repository", () => ({
  productsRepository: {
    createBundleWithWines: vi.fn(),
    createProductWithWine: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByShopId: vi.fn(),
    softDelete: vi.fn(),
    updateBundle: vi.fn(),
    updateProduct: vi.fn(),
    winesExist: vi.fn(),
  },
}));

import { shopsRepository } from "../shops/shops.repository";
import { productsRepository } from "./products.repository";
import { productsService } from "./products.service";

const ownerId = "11111111-1111-1111-1111-111111111111";
const otherId = "22222222-2222-2222-2222-222222222222";
const shopId = "33333333-3333-3333-3333-333333333333";
const productId = "44444444-4444-4444-4444-444444444444";
const bundleId = "55555555-5555-5555-5555-555555555555";
const wineId1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const wineId2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const mockShop = { deletedAt: null, id: shopId, ownerUserId: ownerId } as never;
const mockProduct = { deletedAt: null, id: productId, isBundle: false, shopId } as never;
const mockBundle = { deletedAt: null, id: bundleId, isBundle: true, shopId } as never;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createProduct ────────────────────────────────────────────────────────────

describe("createProduct", () => {
  it("creates product with single wine association", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.winesExist).mockResolvedValue(true);
    vi.mocked(productsRepository.createProductWithWine).mockResolvedValue(mockProduct);

    await productsService.createProduct(shopId, ownerId, {
      name: "Pinot Noir",
      price: "12.99",
      quantity: 10,
      wineId: wineId1,
    });

    expect(productsRepository.createProductWithWine).toHaveBeenCalledWith(
      shopId,
      { name: "Pinot Noir", price: "12.99", quantity: 10, wineId: wineId1 },
      wineId1
    );
  });

  it("throws FORBIDDEN when caller does not own the shop", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);

    await expect(
      productsService.createProduct(shopId, otherId, {
        name: "Wine",
        price: "10.00",
        quantity: 1,
        wineId: wineId1,
      })
    ).rejects.toThrow("FORBIDDEN");

    expect(productsRepository.createProductWithWine).not.toHaveBeenCalled();
  });

  it("throws INVALID_WINE when wineId does not exist", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.winesExist).mockResolvedValue(false);

    await expect(
      productsService.createProduct(shopId, ownerId, {
        name: "Wine",
        price: "10.00",
        quantity: 1,
        wineId: wineId1,
      })
    ).rejects.toThrow("INVALID_WINE");
  });
});

// ─── createBundle ─────────────────────────────────────────────────────────────

describe("createBundle", () => {
  const bundleWines = [
    { quantity: 2, wineId: wineId1 },
    { quantity: 1, wineId: wineId2 },
  ];

  it("creates bundle with 2+ wines and isBundle=true", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.winesExist).mockResolvedValue(true);
    vi.mocked(productsRepository.createBundleWithWines).mockResolvedValue(mockBundle);

    await productsService.createBundle(shopId, ownerId, {
      name: "Holiday Pack",
      price: "29.99",
      quantity: 5,
      wines: bundleWines,
    });

    expect(productsRepository.createBundleWithWines).toHaveBeenCalledWith(
      shopId,
      { name: "Holiday Pack", price: "29.99", quantity: 5, wines: bundleWines },
      bundleWines
    );
  });

  it("throws INVALID_WINE when any wineId does not exist", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.winesExist).mockResolvedValue(false);

    await expect(
      productsService.createBundle(shopId, ownerId, {
        name: "Pack",
        price: "20.00",
        quantity: 3,
        wines: bundleWines,
      })
    ).rejects.toThrow("INVALID_WINE");
  });

  it("throws BUNDLE_MIN_WINES when fewer than 2 wines are provided", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);

    await expect(
      productsService.createBundle(shopId, ownerId, {
        name: "Solo Pack",
        price: "10.00",
        quantity: 1,
        wines: [{ quantity: 1, wineId: wineId1 }],
      })
    ).rejects.toThrow("BUNDLE_MIN_WINES");

    expect(productsRepository.winesExist).not.toHaveBeenCalled();
  });
});

// ─── updateBundle ─────────────────────────────────────────────────────────────

describe("updateBundle", () => {
  it("replaces all wine associations atomically on bundle update", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.findById).mockResolvedValue(mockBundle);
    vi.mocked(productsRepository.winesExist).mockResolvedValue(true);
    vi.mocked(productsRepository.updateBundle).mockResolvedValue(mockBundle);

    const newWines = [
      { quantity: 3, wineId: wineId1 },
      { quantity: 1, wineId: wineId2 },
    ];
    await productsService.updateBundle(shopId, bundleId, ownerId, { wines: newWines });

    expect(productsRepository.updateBundle).toHaveBeenCalledWith(bundleId, {}, newWines);
  });

  it("throws NOT_FOUND when passing regular product ID to bundle endpoint", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.findById).mockResolvedValue(mockProduct); // isBundle === false

    await expect(
      productsService.updateBundle(shopId, productId, ownerId, { name: "New Name" })
    ).rejects.toThrow("NOT_FOUND");
  });
});

// ─── deleteProduct ────────────────────────────────────────────────────────────

describe("deleteProduct", () => {
  it("soft deletes product by setting deletedAt", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.findById).mockResolvedValue(mockProduct);

    await productsService.deleteProduct(shopId, productId, ownerId);

    expect(productsRepository.softDelete).toHaveBeenCalledWith(productId);
  });

  it("throws NOT_FOUND when passing bundle ID to product delete endpoint", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop);
    vi.mocked(productsRepository.findById).mockResolvedValue(mockBundle); // isBundle === true

    await expect(productsService.deleteProduct(shopId, bundleId, ownerId)).rejects.toThrow(
      "NOT_FOUND"
    );
  });
});

describe("getProduct", () => {
  it("returns product when found", async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(mockProduct);
    const result = await productsService.getProduct(productId);
    expect(result).toEqual(mockProduct);
  });

  it("throws NOT_FOUND when product not found", async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(undefined);
    await expect(productsService.getProduct(productId)).rejects.toThrow("NOT_FOUND");
  });
});

describe("listProducts", () => {
  it("returns products for a shop", async () => {
    vi.mocked(productsRepository.findByShopId).mockResolvedValue([mockProduct]);
    const result = await productsService.listProducts(shopId);
    expect(result).toHaveLength(1);
    expect(productsRepository.findByShopId).toHaveBeenCalledWith(shopId, undefined);
  });
});

describe("getAllProducts", () => {
  const mockRows = [
    {
      avgRating: "4.2",
      id: productId,
      isBundle: false,
      name: "Château Noir",
      price: "12.99",
      quantity: 5,
      reviewCount: 3,
      shopId,
      shopName: "The Wine Shop",
    },
  ];

  const mockEnriched = [
    {
      id: productId,
      productWines: [
        {
          wine: {
            color: "red",
            id: wineId1,
            name: "Pinot Noir",
            region: "Burgundy",
            type: "still",
            vintageYear: 2020,
            winemaker: { name: "Jean Dupont" },
          },
        },
      ],
    },
  ];

  it("returns paginated envelope with correct shape", async () => {
    vi.mocked(productsRepository.findAll).mockResolvedValue({ rows: mockRows, total: 1 });
    vi.mocked(productsRepository.findByIds).mockResolvedValue(mockEnriched as never);

    const result = await productsService.getAllProducts({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it("coerces avgRating string to number and maps null correctly", async () => {
    const noRatingRows = [
      {
        avgRating: null,
        id: productId,
        isBundle: false,
        name: "Château Noir",
        price: "12.99",
        quantity: 5,
        reviewCount: 0,
        shopId,
        shopName: "The Wine Shop",
      },
    ];
    vi.mocked(productsRepository.findAll).mockResolvedValue({ rows: noRatingRows, total: 1 });
    vi.mocked(productsRepository.findByIds).mockResolvedValue(mockEnriched as never);

    const result = await productsService.getAllProducts({});
    expect(result.data[0]?.rating).toBeNull();

    vi.mocked(productsRepository.findAll).mockResolvedValue({ rows: mockRows, total: 1 });
    vi.mocked(productsRepository.findByIds).mockResolvedValue(mockEnriched as never);

    const result2 = await productsService.getAllProducts({});
    expect(result2.data[0]?.rating).toBe(4.2);
  });

  it("maps wine details and winemaker name correctly", async () => {
    vi.mocked(productsRepository.findAll).mockResolvedValue({ rows: mockRows, total: 1 });
    vi.mocked(productsRepository.findByIds).mockResolvedValue(mockEnriched as never);

    const result = await productsService.getAllProducts({});
    const wine = result.data[0]?.wines[0];

    expect(wine).toEqual({
      color: "red",
      id: wineId1,
      name: "Pinot Noir",
      region: "Burgundy",
      type: "still",
      vintageYear: 2020,
      winemaker: { name: "Jean Dupont" },
    });
  });

  it("passes filters through to repository", async () => {
    vi.mocked(productsRepository.findAll).mockResolvedValue({ rows: [], total: 0 });

    await productsService.getAllProducts({ color: "red", minPrice: 10, page: 2 });

    expect(productsRepository.findAll).toHaveBeenCalledWith(
      { color: "red", minPrice: 10 },
      { limit: 20, offset: 20 }
    );
    expect(productsRepository.findByIds).not.toHaveBeenCalled();
>>>>>>> origin/main
  });
});
