import { beforeEach, describe, expect, it, vi } from "vitest";
import * as shopsRepo from "../shops/shops.repository";
import * as supplyAgreementsRepo from "../supply-agreements/supply-agreements.repository";
import { NoSupplyAgreementError, ProductNotFoundError } from "./products.errors";
import * as productsRepo from "./products.repository";
import { productsService } from "./products.service";

vi.mock("./products.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./products.repository")>();
  return {
    ...actual,
    create: vi.fn(),
    createProductWines: vi.fn(),
    deleteProductWines: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByIds: vi.fn(),
    getWinemakerIdsForWines: vi.fn(),
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

vi.mock("../supply-agreements/supply-agreements.repository", () => ({
  listApprovedWinemakerIdsForShop: vi.fn(),
}));

vi.mock("../../db", () => {
  const m = {
    transaction: vi.fn((cb) => cb(m)),
  };
  return { db: m };
});

describe("productsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: the wine's winemaker has an approved agreement, so existing
    // creation tests are unaffected by the supply gate.
    vi.mocked(productsRepo.getWinemakerIdsForWines).mockResolvedValue(["wm1"]);
    vi.mocked(supplyAgreementsRepo.listApprovedWinemakerIdsForShop).mockResolvedValue(["wm1"]);
  });

  const shopId = "s1";
  const requesterId = "u1";
  const productId = "p1";

  describe("createProductOrBundle supply gating", () => {
    const baseSingle = {
      name: "P",
      price: "10.00",
      quantity: 1,
      wineId: "wine1",
    };

    it("rejects a single product when the winemaker has no approved agreement", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({
        id: shopId,
        ownerUserId: requesterId,
      } as never);
      vi.mocked(productsRepo.winesExist).mockResolvedValue(true);
      vi.mocked(productsRepo.getWinemakerIdsForWines).mockResolvedValue(["wm1"]);
      vi.mocked(supplyAgreementsRepo.listApprovedWinemakerIdsForShop).mockResolvedValue([]);

      await expect(
        productsService.createProductOrBundle(shopId, requesterId, baseSingle)
      ).rejects.toBeInstanceOf(NoSupplyAgreementError);

      expect(productsRepo.create).not.toHaveBeenCalled();
    });

    it("allows a single product when the winemaker is approved", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({
        id: shopId,
        ownerUserId: requesterId,
      } as never);
      vi.mocked(productsRepo.winesExist).mockResolvedValue(true);
      vi.mocked(productsRepo.getWinemakerIdsForWines).mockResolvedValue(["wm1"]);
      vi.mocked(supplyAgreementsRepo.listApprovedWinemakerIdsForShop).mockResolvedValue(["wm1"]);
      vi.mocked(productsRepo.getWineQuantityForUpdate).mockResolvedValue(100);
      vi.mocked(productsRepo.create).mockResolvedValue({ id: "p1" } as never);

      const result = await productsService.createProductOrBundle(shopId, requesterId, baseSingle);

      expect(result.id).toBe("p1");
    });
  });

  describe("getAllProducts", () => {
    it("maps imageUrl from catalog rows into response items", async () => {
      vi.mocked(productsRepo.findAll).mockResolvedValue({
        rows: [
          {
            avgRating: null,
            id: productId,
            imageUrl: "/uploads/product/p.webp",
            isBundle: false,
            name: "P",
            price: "10.00",
            quantity: 5,
            reviewCount: 0,
            shopId: "s1",
            shopName: "Shop",
          },
        ],
        total: 1,
      } as any);
      vi.mocked(productsRepo.findByIds).mockResolvedValue([
        { id: productId, productWines: [] },
      ] as any);

      const result = await productsService.getAllProducts({ page: 1 });

      expect(result.data[0].imageUrl).toBe("/uploads/product/p.webp");
    });

    it("passes through a null imageUrl when the product has no image", async () => {
      vi.mocked(productsRepo.findAll).mockResolvedValue({
        rows: [
          {
            avgRating: null,
            id: productId,
            imageUrl: null,
            isBundle: false,
            name: "P",
            price: "10.00",
            quantity: 5,
            reviewCount: 0,
            shopId: "s1",
            shopName: "Shop",
          },
        ],
        total: 1,
      } as any);
      vi.mocked(productsRepo.findByIds).mockResolvedValue([
        { id: productId, productWines: [] },
      ] as any);

      const result = await productsService.getAllProducts({ page: 1 });

      expect(result.data[0].imageUrl).toBeNull();
    });
  });

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
  });
});
