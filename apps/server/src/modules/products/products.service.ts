import type { Product } from "../../db/schema";
import { parsePagination } from "../../utils/pagination";
import type { PaginatedResult } from "../../utils/pagination";
import { shopsRepository } from "../shops/shops.repository";
import type { ProductCatalogFilters, ProductWithWines } from "./products.repository";
import { productsRepository } from "./products.repository";

async function assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
  const shop = await shopsRepository.findById(shopId);
  if (!shop) throw new Error("NOT_FOUND");
  if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");
}

type CatalogProductItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  isBundle: boolean;
  shop: { id: string; name: string };
  rating: number | null;
  reviewCount: number;
  wines: Array<{
    id: string;
    name: string;
    color: string;
    type: string;
    region: string;
    vintageYear: number;
    winemaker: { name: string };
  }>;
};

export const productsService = {
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

  async deleteBundle(shopId: string, bundleId: string, requesterId: string): Promise<void> {
    await assertShopOwnership(shopId, requesterId);

    const product = await productsRepository.findById(bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) throw new Error("NOT_FOUND");

    await productsRepository.softDelete(bundleId);
  },

  async deleteProduct(shopId: string, productId: string, requesterId: string): Promise<void> {
    await assertShopOwnership(shopId, requesterId);

    const product = await productsRepository.findById(productId);
    if (!product || product.shopId !== shopId || product.isBundle) throw new Error("NOT_FOUND");

    await productsRepository.softDelete(productId);
  },

  async getProduct(id: string): Promise<ProductWithWines> {
    const product = await productsRepository.findById(id);
    if (!product) throw new Error("NOT_FOUND");
    return product;
  },
  async listProducts(shopId: string, isBundle?: boolean): Promise<ProductWithWines[]> {
    const shop = await shopsRepository.findById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    return productsRepository.findByShopId(shopId, isBundle);
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

  async getAllProducts(
    query: ProductCatalogFilters & { page?: number }
  ): Promise<PaginatedResult<CatalogProductItem>> {
    const { page = 1, ...filters } = query;
    const { limit, offset } = parsePagination({ page });

    const { rows, total } = await productsRepository.findAll(filters, { limit, offset });

    if (rows.length === 0) {
      return { data: [], limit, page, total };
    }

    const enriched = await productsRepository.findByIds(rows.map((r) => r.id));
    const winesMap = new Map(enriched.map((p) => [p.id, p.productWines]));

    const data: CatalogProductItem[] = rows.map((row) => ({
      id: row.id,
      isBundle: row.isBundle,
      name: row.name,
      price: row.price,
      quantity: row.quantity,
      rating: row.avgRating !== null ? Number.parseFloat(row.avgRating) : null,
      reviewCount: row.reviewCount,
      shop: { id: row.shopId, name: row.shopName },
      wines: (winesMap.get(row.id) ?? []).map((pw) => ({
        color: pw.wine.color,
        id: pw.wine.id,
        name: pw.wine.name,
        region: pw.wine.region,
        type: pw.wine.type,
        vintageYear: pw.wine.vintageYear,
        winemaker: { name: pw.wine.winemaker.name },
      })),
    }));

    return { data, limit, page, total };
  },
};
