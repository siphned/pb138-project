import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../shops/shops.repository", () => ({
  shopsRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByOwnerUserId: vi.fn(),
    createShopWithAddress: vi.fn(),
    insertAddress: vi.fn(),
    updateById: vi.fn(),
  },
}));

vi.mock("./products.repository", () => ({
  productsRepository: {
    findById: vi.fn(),
    findByShopId: vi.fn(),
    winesExist: vi.fn(),
    createProductWithWine: vi.fn(),
    createBundleWithWines: vi.fn(),
    updateProduct: vi.fn(),
    updateBundle: vi.fn(),
    softDelete: vi.fn(),
  },
}));

import { productsService } from "./products.service";
import { shopsRepository } from "../shops/shops.repository";
import { productsRepository } from "./products.repository";

const ownerId = "11111111-1111-1111-1111-111111111111";
const otherId = "22222222-2222-2222-2222-222222222222";
const shopId = "33333333-3333-3333-3333-333333333333";
const productId = "44444444-4444-4444-4444-444444444444";
const bundleId = "55555555-5555-5555-5555-555555555555";
const wineId1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const wineId2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const mockShop = { id: shopId, ownerUserId: ownerId, deletedAt: null } as never;
const mockProduct = { id: productId, shopId, isBundle: false, deletedAt: null } as never;
const mockBundle = { id: bundleId, shopId, isBundle: true, deletedAt: null } as never;

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
    { wineId: wineId1, quantity: 2 },
    { wineId: wineId2, quantity: 1 },
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
        wines: [{ wineId: wineId1, quantity: 1 }],
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
      { wineId: wineId1, quantity: 3 },
      { wineId: wineId2, quantity: 1 },
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
