import { BadRequestError } from "@repo/shared";
import type { Product, ProductWine } from "@repo/shared/schemas";
import { type Database, db } from "../../db";
import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import { ForbiddenShopActionError, ShopNotFoundError } from "../shops/shops.errors";
import * as shopsRepo from "../shops/shops.repository";
import {
  BundleMinWinesError,
  DuplicateWineError,
  InsufficientStockError,
  InvalidWineError,
  ProductNotFoundError,
} from "./products.errors";
import type { ProductCatalogFilters, ProductWithWines } from "./products.repository";
import * as productsRepo from "./products.repository";

type CatalogProductItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  isBundle: boolean;
  imageUrl: string | null;
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

      await productsRepo.updateWineQuantity(tx, tw.wineId, -total);
    }
  }

  private async revertBundleAllocations(
    tx: Database,
    product: Product & { productWines: ProductWine[] }
  ) {
    for (const pw of product.productWines) {
      await productsRepo.updateWineQuantity(tx, pw.wineId, pw.quantity * product.quantity);
    }
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
      imageUrl: row.imageUrl,
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

  async createProductOrBundle(
    shopId: string,
    requesterId: string,
    data:
      | { name: string; description?: string; price: string; quantity: number; wineId: string }
      | {
          name: string;
          description?: string;
          price: string;
          quantity: number;
          wines: { wineId: string; quantity: number }[];
        }
  ): Promise<Product> {
    await this.assertShopOwnership(shopId, requesterId);

    if ("wines" in data) {
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

    const winesExist = await productsRepo.winesExist(db, [data.wineId]);
    if (!winesExist) throw new InvalidWineError();

    return db.transaction(async (tx) => {
      const currentQty = await productsRepo.getWineQuantityForUpdate(tx, data.wineId);
      if (currentQty === undefined || currentQty < data.quantity) {
        throw new InsufficientStockError();
      }

      await productsRepo.updateWineQuantity(tx, data.wineId, -data.quantity);

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

  async deleteProductOrBundle(
    shopId: string,
    productId: string,
    requesterId: string
  ): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const product = await productsRepo.findById(db, productId);
    if (!product || product.shopId !== shopId) {
      throw new ProductNotFoundError(productId);
    }

    await db.transaction(async (tx) => {
      await this.revertBundleAllocations(tx, product);
      await productsRepo.update(tx, productId, { deletedAt: new Date() });
    });
  }

  private async applyBundleUpdate(
    tx: Database,
    productId: string,
    product: ProductWithWines,
    data: {
      name?: string;
      description?: string | null;
      price?: string;
      quantity?: number;
      wines?: { wineId: string; quantity: number }[];
    }
  ): Promise<Product> {
    await this.revertBundleAllocations(tx, product);

    const targetWines =
      data.wines ??
      product.productWines.map((pw) => ({ quantity: pw.quantity, wineId: pw.wineId }));
    const newQty = data.quantity ?? product.quantity;
    await this.applyBundleAllocations(tx, targetWines, newQty);

    const updated = await productsRepo.update(tx, productId, {
      description: data.description,
      name: data.name,
      price: data.price,
      quantity: data.quantity,
    });

    if (data.wines !== undefined) {
      if (data.wines.length < 2) throw new BundleMinWinesError();
      const wineIds = data.wines.map((w) => w.wineId);
      if (new Set(wineIds).size !== wineIds.length) throw new DuplicateWineError();
      const winesExist = await productsRepo.winesExist(db, wineIds);
      if (!winesExist) throw new InvalidWineError();
      await productsRepo.deleteProductWines(tx, productId);
      await productsRepo.createProductWines(
        tx,
        data.wines.map((w) => ({ productId, quantity: w.quantity, wineId: w.wineId }))
      );
    }

    return updated;
  }

  private async applySingleProductUpdate(
    tx: Database,
    productId: string,
    product: ProductWithWines,
    data: {
      name?: string;
      description?: string | null;
      price?: string;
      quantity?: number;
      wineId?: string;
    }
  ): Promise<Product> {
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
      await productsRepo.createProductWines(tx, [{ productId, quantity: 1, wineId: data.wineId }]);
    }

    return updated;
  }

  private async validateBundleWines(wines: { wineId: string; quantity: number }[]): Promise<void> {
    if (wines.length < 2) throw new Error("BUNDLE_MIN_WINES");
    const wineIds = wines.map((w) => w.wineId);
    if (new Set(wineIds).size !== wineIds.length) throw new Error("DUPLICATE_WINE");
    const winesExist = await productsRepo.winesExist(db, wineIds);
    if (!winesExist) throw new InvalidWineError();
  }

  async updateProductOrBundle(
    shopId: string,
    productId: string,
    requesterId: string,
    data: {
      name?: string;
      description?: string | null;
      price?: string;
      quantity?: number;
      wineId?: string;
      wines?: { wineId: string; quantity: number }[];
    }
  ): Promise<Product> {
    if (data.wines !== undefined && data.wineId !== undefined) {
      throw new BadRequestError(
        "Provide either wineId or wines, not both",
        "CONFLICTING_UPDATE_FIELDS"
      );
    }

    const product = await productsRepo.findById(db, productId);
    if (!product || product.shopId !== shopId) {
      throw new ProductNotFoundError(productId);
    }

    await this.assertShopOwnership(shopId, requesterId);

    if (data.wines !== undefined && !product.isBundle) {
      throw new BadRequestError(
        "Cannot update bundle wines on a non-bundle product",
        "NOT_A_BUNDLE"
      );
    }

    if (product.isBundle) {
      if (data.wines !== undefined) {
        await this.validateBundleWines(data.wines);
      }
      return db.transaction((tx) => this.applyBundleUpdate(tx, productId, product, data));
    }

    if (data.wineId !== undefined) {
      const winesExist = await productsRepo.winesExist(db, [data.wineId]);
      if (!winesExist) throw new InvalidWineError();
    }

    return db.transaction((tx) => this.applySingleProductUpdate(tx, productId, product, data));
  }
}

export const productsService = new ProductsService();
