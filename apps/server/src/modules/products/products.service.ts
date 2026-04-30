import type { Product } from "@repo/shared/schemas";
import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import { type IShopsRepository, shopsRepository } from "../shops/shops.repository";
import {
  type IProductsRepository,
  type ProductCatalogFilters,
  type ProductWithWines,
  productsRepository,
} from "./products.repository";

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

export class ProductsService {
  constructor(
    private productsRepo: IProductsRepository,
    private shopsRepo: IShopsRepository
  ) {}

  private async assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");
  }

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
    await this.assertShopOwnership(shopId, requesterId);

    if (data.wines.length < 2) throw new Error("BUNDLE_MIN_WINES");

    const wineIds = data.wines.map((w) => w.wineId);
    if (new Set(wineIds).size !== wineIds.length) throw new Error("DUPLICATE_WINE");

    const winesExist = await this.productsRepo.winesExist(wineIds);
    if (!winesExist) throw new Error("INVALID_WINE");

    return this.productsRepo.createBundleWithWines(shopId, data, data.wines);
  }

  async createProduct(
    shopId: string,
    requesterId: string,
    data: { name: string; description?: string; price: string; quantity: number; wineId: string }
  ): Promise<Product> {
    await this.assertShopOwnership(shopId, requesterId);

    const winesExist = await this.productsRepo.winesExist([data.wineId]);
    if (!winesExist) throw new Error("INVALID_WINE");

    return this.productsRepo.createProductWithWine(shopId, data, data.wineId);
  }

  async deleteBundle(shopId: string, bundleId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const product = await this.productsRepo.findById(bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) throw new Error("NOT_FOUND");

    await this.productsRepo.softDelete(bundleId);
  }

  async deleteProduct(shopId: string, productId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const product = await this.productsRepo.findById(productId);
    if (!product || product.shopId !== shopId || product.isBundle) throw new Error("NOT_FOUND");

    await this.productsRepo.softDelete(productId);
  }

  async getAllProducts(
    query: ProductCatalogFilters & { page?: number }
  ): Promise<PaginatedResult<CatalogProductItem>> {
    const { page = 1, ...filters } = query;
    const { limit, offset } = parsePagination({ page });

    const { rows, total } = await this.productsRepo.findAll(filters, { limit, offset });

    if (rows.length === 0) {
      return { data: [], limit, page, total };
    }

    const enriched = await this.productsRepo.findByIds(rows.map((r) => r.id));
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
  }

  async getProduct(id: string): Promise<ProductWithWines> {
    const product = await this.productsRepo.findById(id);
    if (!product) throw new Error("NOT_FOUND");
    return product;
  }

  async listProducts(shopId: string, isBundle?: boolean): Promise<ProductWithWines[]> {
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    return this.productsRepo.findByShopId(shopId, isBundle);
  }

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
    await this.assertShopOwnership(shopId, requesterId);

    const product = await this.productsRepo.findById(bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) throw new Error("NOT_FOUND");

    if (data.wines !== undefined) {
      if (data.wines.length < 2) throw new Error("BUNDLE_MIN_WINES");
      const wineIds = data.wines.map((w) => w.wineId);
      if (new Set(wineIds).size !== wineIds.length) throw new Error("DUPLICATE_WINE");
      const winesExist = await this.productsRepo.winesExist(wineIds);
      if (!winesExist) throw new Error("INVALID_WINE");
    }

    const { wines, ...fields } = data;
    return this.productsRepo.updateBundle(bundleId, fields, wines);
  }

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
    await this.assertShopOwnership(shopId, requesterId);

    const product = await this.productsRepo.findById(productId);
    if (!product || product.shopId !== shopId || product.isBundle) throw new Error("NOT_FOUND");

    if (data.wineId !== undefined) {
      const winesExist = await this.productsRepo.winesExist([data.wineId]);
      if (!winesExist) throw new Error("INVALID_WINE");
    }

    const { wineId, ...fields } = data;
    return this.productsRepo.updateProduct(productId, fields, wineId);
  }
}

export const productsService = new ProductsService(productsRepository, shopsRepository);
