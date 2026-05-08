import type { Product, ProductWine } from "@repo/shared/schemas";
import { sql } from "drizzle-orm";
import { type Database, db } from "../../db";
import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import { ForbiddenShopActionError, ShopNotFoundError } from "../shops/shops.errors";
import * as shopsRepo from "../shops/shops.repository";
import { InsufficientStockError, InvalidWineError, ProductNotFoundError } from "./products.errors";
import type { ProductCatalogFilters, ProductWithWines } from "./products.repository";
import * as productsRepo from "./products.repository";

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
  private async assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);
    if (shop.ownerUserId !== requesterId) throw new ForbiddenShopActionError();
  }

  private async applyBundleAllocations(
    tx: Database,
    targetWines: { wineId: string; quantity: number }[],
    newQty: number
  ) {
    for (const tw of targetWines) {
      const total = tw.quantity * newQty;
      const currentQty = await productsRepo.getWineQuantityForUpdate(tx, tw.wineId);

      if (currentQty === undefined || currentQty < total) {
        throw new InsufficientStockError();
      }

      await productsRepo.updateWineQuantity(tx, tw.wineId, sql`${sql.raw("quantity")} - ${total}`);
    }
  }

  private async revertBundleAllocations(
    tx: Database,
    product: Product & { productWines: ProductWine[] }
  ) {
    for (const pw of product.productWines) {
      await productsRepo.updateWineQuantity(
        tx,
        pw.wineId,
        sql`${sql.raw("quantity")} + ${pw.quantity * product.quantity}`
      );
    }
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

    const winesExist = await productsRepo.winesExist(db, wineIds);
    if (!winesExist) throw new InvalidWineError();

    return db.transaction(async (tx) => {
      await this.applyBundleAllocations(tx, data.wines, data.quantity);

      const product = await productsRepo.create(tx, {
        description: data.description ?? null,
        isBundle: true,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        shopId,
      });

      await productsRepo.createProductWines(
        tx,
        data.wines.map((w) => ({
          productId: product.id,
          quantity: w.quantity,
          wineId: w.wineId,
        }))
      );

      return product;
    });
  }

  async createProduct(
    shopId: string,
    requesterId: string,
    data: { name: string; description?: string; price: string; quantity: number; wineId: string }
  ): Promise<Product> {
    await this.assertShopOwnership(shopId, requesterId);

    const winesExist = await productsRepo.winesExist(db, [data.wineId]);
    if (!winesExist) throw new InvalidWineError();

    return db.transaction(async (tx) => {
      const currentQty = await productsRepo.getWineQuantityForUpdate(tx, data.wineId);
      if (currentQty === undefined || currentQty < data.quantity) {
        throw new InsufficientStockError();
      }

      await productsRepo.updateWineQuantity(
        tx,
        data.wineId,
        sql`${sql.raw("quantity")} - ${data.quantity}`
      );

      const product = await productsRepo.create(tx, {
        description: data.description ?? null,
        isBundle: false,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        shopId,
      });

      await productsRepo.createProductWines(tx, [
        { productId: product.id, quantity: 1, wineId: data.wineId },
      ]);

      return product;
    });
  }

  async deleteBundle(shopId: string, bundleId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const product = await productsRepo.findById(db, bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) {
      throw new ProductNotFoundError(bundleId);
    }

    await db.transaction(async (tx) => {
      await this.revertBundleAllocations(tx, product);
      await productsRepo.update(tx, bundleId, { deletedAt: new Date() });
    });
  }

  async deleteProduct(shopId: string, productId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const product = await productsRepo.findById(db, productId);
    if (!product || product.shopId !== shopId || product.isBundle) {
      throw new ProductNotFoundError(productId);
    }

    await db.transaction(async (tx) => {
      await this.revertBundleAllocations(tx, product);
      await productsRepo.update(tx, productId, { deletedAt: new Date() });
    });
  }

  async getAllProducts(
    query: ProductCatalogFilters & { page?: number }
  ): Promise<PaginatedResult<CatalogProductItem>> {
    const { page = 1, ...filters } = query;
    const { limit, offset } = parsePagination({ page });

    const { rows, total } = await productsRepo.findAll(db, filters, { limit, offset });

    if (rows.length === 0) {
      return { data: [], limit, page, total };
    }

    const enriched = await productsRepo.findByIds(
      db,
      rows.map((r) => r.id)
    );
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
    const product = await productsRepo.findById(db, id);
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }

  async listProducts(shopId: string, isBundle?: boolean): Promise<ProductWithWines[]> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);
    return productsRepo.findByShopId(db, shopId, isBundle);
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

    const product = await productsRepo.findById(db, bundleId);
    if (!product || product.shopId !== shopId || !product.isBundle) {
      throw new ProductNotFoundError(bundleId);
    }

    if (data.wines !== undefined) {
      if (data.wines.length < 2) throw new Error("BUNDLE_MIN_WINES");
      const wineIds = data.wines.map((w) => w.wineId);
      if (new Set(wineIds).size !== wineIds.length) throw new Error("DUPLICATE_WINE");
      const winesExist = await productsRepo.winesExist(db, wineIds);
      if (!winesExist) throw new InvalidWineError();
    }

    return db.transaction(async (tx) => {
      await this.revertBundleAllocations(tx, product);

      const targetWines =
        data.wines ??
        product.productWines.map((pw) => ({ quantity: pw.quantity, wineId: pw.wineId }));
      const newQty = data.quantity ?? product.quantity;
      await this.applyBundleAllocations(tx, targetWines, newQty);

      const updated = await productsRepo.update(tx, bundleId, {
        description: data.description,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
      });

      if (data.wines !== undefined) {
        await productsRepo.deleteProductWines(tx, bundleId);
        await productsRepo.createProductWines(
          tx,
          data.wines.map((w) => ({
            productId: bundleId,
            quantity: w.quantity,
            wineId: w.wineId,
          }))
        );
      }

      return updated;
    });
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

    const product = await productsRepo.findById(db, productId);
    if (!product || product.shopId !== shopId || product.isBundle) {
      throw new ProductNotFoundError(productId);
    }

    if (data.wineId !== undefined) {
      const winesExist = await productsRepo.winesExist(db, [data.wineId]);
      if (!winesExist) throw new InvalidWineError();
    }

    return db.transaction(async (tx) => {
      await this.revertBundleAllocations(tx, product);

      const targetWineId = data.wineId ?? product.productWines[0]?.wineId;
      if (!targetWineId) throw new Error("INCONSISTENT_DATA");

      const newQty = data.quantity ?? product.quantity;
      await this.applyBundleAllocations(tx, [{ quantity: 1, wineId: targetWineId }], newQty);

      const updated = await productsRepo.update(tx, productId, {
        description: data.description,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
      });

      if (data.wineId !== undefined) {
        await productsRepo.deleteProductWines(tx, productId);
        await productsRepo.createProductWines(tx, [
          { productId, quantity: 1, wineId: data.wineId },
        ]);
      }

      return updated;
    });
  }
}

export const productsService = new ProductsService();
