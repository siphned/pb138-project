import { shopsRepository } from "../shops/shops.repository";
import { productsRepository } from "./products.repository";
import type { ProductWithWines } from "./products.repository";
import type { Product } from "../../db/schema";

async function assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
  const shop = await shopsRepository.findById(shopId);
  if (!shop) throw new Error("NOT_FOUND");
  if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");
}

export const productsService = {
  async listProducts(shopId: string, isBundle?: boolean): Promise<ProductWithWines[]> {
    const shop = await shopsRepository.findById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    return productsRepository.findByShopId(shopId, isBundle);
  },

  async getProduct(id: string): Promise<ProductWithWines> {
    const product = await productsRepository.findById(id);
    if (!product) throw new Error("NOT_FOUND");
    return product;
  },

  async createProduct(
    shopId: string,
    requesterId: string,
    data: { name: string; description?: string; price: string; quantity: number; wineId: string }
  ): Promise<Product> {
    await assertShopOwnership(shopId, requesterId);

    const winesExist = await productsRepository.winesExist([data.wineId]);
    if (!winesExist) throw new Error("INVALID_WINE");

    return productsRepository.createProductWithWine(shopId, data, data.wineId);
  },

  async createBundle(
    shopId: string,
    requesterId: string,
    data: {
      name: string;
      description?: string;
      price: string;
      quantity: number;
      wines: { wineId: string; quantity: number }[];
    }
  ): Promise<Product> {
    await assertShopOwnership(shopId, requesterId);

    if (data.wines.length < 2) throw new Error("BUNDLE_MIN_WINES");

    const wineIds = data.wines.map((w) => w.wineId);
    if (new Set(wineIds).size !== wineIds.length) throw new Error("DUPLICATE_WINE");

    const winesExist = await productsRepository.winesExist(wineIds);
    if (!winesExist) throw new Error("INVALID_WINE");

    return productsRepository.createBundleWithWines(shopId, data, data.wines);
  },

  async updateProduct(
    shopId: string,
    productId: string,
    requesterId: string,
    data: {
      name?: string;
      description?: string | null;
      price?: string;
      quantity?: number;
      wineId?: string;
    }
  ): Promise<Product> {
    await assertShopOwnership(shopId, requesterId);

    const product = await productsRepository.findById(productId);
    if (!product || product.shopId !== shopId || product.isBundle) throw new Error("NOT_FOUND");

    if (data.wineId !== undefined) {
      const winesExist = await productsRepository.winesExist([data.wineId]);
      if (!winesExist) throw new Error("INVALID_WINE");
    }

    const { wineId, ...fields } = data;
    return productsRepository.updateProduct(productId, fields, wineId);
  },

  async updateBundle(
    shopId: string,
    bundleId: string,
    requesterId: string,
    data: {
      name?: string;
      description?: string | null;
      price?: string;
      quantity?: number;
      wines?: { wineId: string; quantity: number }[];
    }
  ): Promise<Product> {
    await assertShopOwnership(shopId, requesterId);

    const product = await productsRepository.findById(bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) throw new Error("NOT_FOUND");

    if (data.wines !== undefined) {
      if (data.wines.length < 2) throw new Error("BUNDLE_MIN_WINES");
      const wineIds = data.wines.map((w) => w.wineId);
      if (new Set(wineIds).size !== wineIds.length) throw new Error("DUPLICATE_WINE");
      const winesExist = await productsRepository.winesExist(wineIds);
      if (!winesExist) throw new Error("INVALID_WINE");
    }

    const { wines, ...fields } = data;
    return productsRepository.updateBundle(bundleId, fields, wines);
  },

  async deleteProduct(shopId: string, productId: string, requesterId: string): Promise<void> {
    await assertShopOwnership(shopId, requesterId);

    const product = await productsRepository.findById(productId);
    if (!product || product.shopId !== shopId || product.isBundle) throw new Error("NOT_FOUND");

    await productsRepository.softDelete(productId);
  },

  async deleteBundle(shopId: string, bundleId: string, requesterId: string): Promise<void> {
    await assertShopOwnership(shopId, requesterId);

    const product = await productsRepository.findById(bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) throw new Error("NOT_FOUND");

    await productsRepository.softDelete(bundleId);
  },
};
