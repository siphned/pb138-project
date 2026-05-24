import type { NewProduct, NewProductWine, Product, ProductWine, Wine } from "@repo/shared/schemas";
import { products, productWines, reviews, shops, wines } from "@repo/shared/schemas";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
<<<<<<< HEAD
import type { Database } from "../../db";
import { InsufficientStockError } from "./products.errors";
=======
import { db } from "../../db";
>>>>>>> origin/main

export type WineInfo = Pick<
  Wine,
  "id" | "name" | "type" | "color" | "vintageYear" | "alcoholContent" | "volumeMl" | "deletedAt"
<<<<<<< HEAD
> & {
  winemaker: { id: string; name: string };
};
=======
>;
>>>>>>> origin/main

export type ProductWineWithInfo = ProductWine & { wine: WineInfo };

export type ProductWithWines = Product & { productWines: ProductWineWithInfo[] };

export type CatalogWineInfo = Pick<
  Wine,
  "color" | "id" | "name" | "region" | "type" | "vintageYear"
> & {
  winemaker: { name: string };
};

export type ProductWithWinesAndWinemaker = Product & {
  productWines: Array<ProductWine & { wine: CatalogWineInfo }>;
};

export type ProductCatalogFilters = {
<<<<<<< HEAD
  containsProductId?: string;
=======
>>>>>>> origin/main
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  color?: string;
  region?: string;
  rating?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
<<<<<<< HEAD
  q?: string;
  wineId?: string;
  shopId?: string;
  isBundle?: boolean;
=======
  search?: string;
>>>>>>> origin/main
};

export type CatalogRow = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  isBundle: boolean;
  shopId: string;
  shopName: string;
  avgRating: string | null;
  reviewCount: number;
};

<<<<<<< HEAD
export async function create(db: Database, data: NewProduct): Promise<Product> {
  const [product] = await db.insert(products).values(data).returning();
  if (!product) throw new Error("Product insert returned no rows");
  return product;
}

export async function createProductWines(db: Database, data: NewProductWine[]): Promise<void> {
  if (data.length === 0) return;
  await db.insert(productWines).values(data);
}

export async function deleteProductWines(db: Database, productId: string): Promise<void> {
  await db.delete(productWines).where(eq(productWines.productId, productId));
}

export async function decrementStock(db: Database, id: string, amount: number): Promise<void> {
  const [updated] = await db
    .update(products)
    .set({
      quantity: sql`${products.quantity} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), sql`${products.quantity} >= ${amount}`))
    .returning({ id: products.id });

  if (!updated) throw new InsufficientStockError();
}

export async function update(db: Database, id: string, data: Partial<Product>): Promise<Product> {
  const [updated] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  if (!updated) throw new Error("Product not found");
  return updated;
}

export async function findById(db: Database, id: string): Promise<ProductWithWines | undefined> {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), isNull(products.deletedAt)),
    with: {
      productWines: {
        with: {
          wine: {
            columns: {
              alcoholContent: true,
              color: true,
              deletedAt: true,
              id: true,
              name: true,
              type: true,
              vintageYear: true,
              volumeMl: true,
            },
            with: {
              winemaker: { columns: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (product) {
    const typedProduct = product as ProductWithWines;
    if (typedProduct.productWines) {
      typedProduct.productWines = typedProduct.productWines.filter(
        (pw) => pw.wine && !pw.wine.deletedAt
      );
    }
    return typedProduct;
  }
  return undefined;
}

export async function findByIds(
  db: Database,
  ids: string[]
): Promise<ProductWithWinesAndWinemaker[]> {
  if (ids.length === 0) return [];
  return db.query.products.findMany({
    where: and(inArray(products.id, ids), isNull(products.deletedAt)),
    with: {
      productWines: {
        with: {
          wine: {
            columns: {
              color: true,
              id: true,
              name: true,
              region: true,
              type: true,
              vintageYear: true,
            },
            with: {
              winemaker: { columns: { name: true } },
            },
          },
        },
      },
    },
  }) as Promise<ProductWithWinesAndWinemaker[]>;
}

function buildFilterConditions(filters: ProductCatalogFilters): SQL[] {
  const conditions: SQL[] = [isNull(products.deletedAt), isNull(shops.deletedAt)];

  if (filters.minPrice !== undefined) {
    conditions.push(sql`${products.price} >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
  }
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    const searchCond = or(
      ilike(products.name, pattern),
      sql`EXISTS (
        SELECT 1 FROM product_wines pw
        JOIN wines w ON pw.wine_id = w.id
        WHERE pw.product_id = ${products.id}
          AND w.name ILIKE ${pattern}
          AND w.deleted_at IS NULL
      )`
    );
    if (searchCond) {
      conditions.push(searchCond);
    }
  }
  if (filters.type) {
    conditions.push(sql`EXISTS (
      SELECT 1 FROM product_wines pw
      JOIN wines w ON pw.wine_id = w.id
      WHERE pw.product_id = ${products.id}
        AND w.type = ${filters.type}
        AND w.deleted_at IS NULL
    )`);
  }
  if (filters.color) {
    conditions.push(sql`EXISTS (
      SELECT 1 FROM product_wines pw
      JOIN wines w ON pw.wine_id = w.id
      WHERE pw.product_id = ${products.id}
        AND w.color = ${filters.color}
        AND w.deleted_at IS NULL
    )`);
  }
  if (filters.region) {
    const regionPattern = `%${filters.region}%`;
    conditions.push(sql`EXISTS (
      SELECT 1 FROM product_wines pw
      JOIN wines w ON pw.wine_id = w.id
      WHERE pw.product_id = ${products.id}
        AND w.region ILIKE ${regionPattern}
        AND w.deleted_at IS NULL
    )`);
  }
  if (filters.wineId) {
    conditions.push(sql`EXISTS (
      SELECT 1 FROM product_wines pw
      WHERE pw.product_id = ${products.id}
        AND pw.wine_id = ${filters.wineId}
    )`);
  }
  if (filters.containsProductId) {
    conditions.push(sql`EXISTS (
      SELECT 1 FROM product_wines bundle_pw
      WHERE bundle_pw.product_id = ${products.id}
        AND bundle_pw.wine_id IN (
          SELECT pw2.wine_id FROM product_wines pw2
          WHERE pw2.product_id = ${filters.containsProductId}
        )
    )`);
    conditions.push(eq(products.isBundle, true));
  }
  if (filters.shopId !== undefined) {
    conditions.push(eq(products.shopId, filters.shopId));
  }
  if (filters.isBundle !== undefined) {
    conditions.push(eq(products.isBundle, filters.isBundle));
  }

  return conditions;
}

export async function findAll(
  db: Database,
  filters: ProductCatalogFilters,
  pagination: { limit: number; offset: number }
): Promise<{ rows: CatalogRow[]; total: number }> {
  const conditions = buildFilterConditions(filters);

  const reviewsJoinCond = and(
    eq(reviews.entityId, products.id),
    eq(reviews.entityType, "product"),
    isNull(reviews.deletedAt)
  );

  const orderByExpr = (() => {
    switch (filters.sort) {
      case "price-asc":
        return asc(products.price);
      case "price-desc":
        return desc(products.price);
      case "rating":
        return sql`AVG(${reviews.rating}) DESC NULLS LAST`;
      default:
        return desc(products.createdAt);
    }
  })();

  const having =
    filters.rating !== undefined ? sql`AVG(${reviews.rating}) >= ${filters.rating}` : undefined;

  const baseSelect = db
    .select({
      avgRating: sql<string | null>`AVG(${reviews.rating})`,
      id: products.id,
      isBundle: products.isBundle,
      name: products.name,
      price: products.price,
      quantity: products.quantity,
      reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})::int`,
      shopId: products.shopId,
      shopName: shops.name,
    })
    .from(products)
    .innerJoin(shops, eq(products.shopId, shops.id))
    .leftJoin(reviews, reviewsJoinCond)
    .where(and(...conditions))
    .groupBy(products.id, shops.id);

  // biome-ignore lint/suspicious/noExplicitAny: Drizzle uniform chaining
  const rowsQuery: any = having ? baseSelect.having(having) : baseSelect;

  const countBase = db
    .select({ id: products.id })
    .from(products)
    .innerJoin(shops, eq(products.shopId, shops.id))
    .leftJoin(reviews, reviewsJoinCond)
    .where(and(...conditions))
    .groupBy(products.id, shops.id);

  // biome-ignore lint/suspicious/noExplicitAny: subquery cast
  const countSubq = ((having ? countBase.having(having) : countBase) as any).as("subq");

  const [rows, [countResult]] = await Promise.all([
    rowsQuery.orderBy(orderByExpr).limit(pagination.limit).offset(pagination.offset),
    db.select({ total: sql<number>`COUNT(*)::int` }).from(countSubq),
  ]);

  return { rows, total: countResult?.total ?? 0 };
}

export async function getWineQuantityForUpdate(
  db: Database,
  wineId: string
): Promise<number | undefined> {
  const [wine] = await db
    .select({ quantity: wines.quantity })
    .from(wines)
    .where(and(eq(wines.id, wineId), isNull(wines.deletedAt)))
    .for("update");
  return wine?.quantity;
}

export async function updateWineQuantity(
  db: Database,
  wineId: string,
  delta: number
): Promise<void> {
  await db
    .update(wines)
    .set({ quantity: sql`${wines.quantity} + ${delta}` })
    .where(eq(wines.id, wineId));
}

export async function productsExist(db: Database, ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const uniqueIds = [...new Set(ids)];
  const found = await db.query.products.findMany({
    columns: { id: true },
    where: and(inArray(products.id, uniqueIds), isNull(products.deletedAt)),
  });
  return found.length === uniqueIds.length;
}
export async function winesExist(db: Database, wineIds: string[]): Promise<boolean> {
  const uniqueIds = [...new Set(wineIds)];
  const found = await db.query.wines.findMany({
    columns: { id: true },
    where: and(inArray(wines.id, uniqueIds), isNull(wines.deletedAt)),
  });
  return found.length === uniqueIds.length;
}

export const productsRepository = {
  create,
  createProductWines,
  decrementStock,
  deleteProductWines,
  findAll,
  findById,
  findByIds,
  getWineQuantityForUpdate,
  productsExist,
  update,
  updateWineQuantity,
  winesExist,
=======
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface IProductsRepository {
  applyBundleAllocations(
    tx: Transaction,
    targetWines: { wineId: string; quantity: number }[],
    newQty: number
  ): Promise<void>;
  createBundleWithWines(
    shopId: string,
    productData: { name: string; description?: string; price: string; quantity: number },
    wineList: { wineId: string; quantity: number }[]
  ): Promise<Product>;
  createProductWithWine(
    shopId: string,
    productData: { name: string; description?: string; price: string; quantity: number },
    wineId: string
  ): Promise<Product>;
  decrementStock(tx: Transaction, productId: string, quantity: number): Promise<void>;
  findAll(
    filters: ProductCatalogFilters,
    pagination: { limit: number; offset: number }
  ): Promise<{ rows: CatalogRow[]; total: number }>;
  findById(id: string): Promise<ProductWithWines | undefined>;
  findByIds(ids: string[]): Promise<ProductWithWinesAndWinemaker[]>;
  findByShopId(shopId: string, isBundle?: boolean): Promise<ProductWithWines[]>;
  handleSameWineQuantityChange(
    tx: Transaction,
    wineId: string,
    oldQty: number,
    newQty: number
  ): Promise<void>;
  handleWineIdChange(
    tx: Transaction,
    oldId: string,
    oldQty: number,
    newId: string,
    newQty: number
  ): Promise<void>;
  isDeleted(id: string): Promise<boolean>;
  productIdsExist(ids: string[]): Promise<boolean>;
  revertBundleAllocations(
    tx: Transaction,
    product: Product & { productWines: ProductWine[] }
  ): Promise<void>;
  softDelete(id: string): Promise<void>;
  updateBundle(
    id: string,
    fields: { name?: string; description?: string | null; price?: string; quantity?: number },
    newWines?: { wineId: string; quantity: number }[]
  ): Promise<Product>;
  updateProduct(
    id: string,
    fields: { name?: string; description?: string | null; price?: string; quantity?: number },
    newWineId?: string
  ): Promise<Product>;
  winesExist(wineIds: string[]): Promise<boolean>;
}

export const productsRepository: IProductsRepository = {
  async applyBundleAllocations(
    tx: Transaction,
    targetWines: { wineId: string; quantity: number }[],
    newQty: number
  ) {
    for (const tw of targetWines) {
      const total = tw.quantity * newQty;
      const [wine] = await tx
        .select({ quantity: wines.quantity })
        .from(wines)
        .where(eq(wines.id, tw.wineId))
        .for("update");
      if (!wine || wine.quantity < total) throw new Error("NOT_ENOUGH_STOCK");

      await tx
        .update(wines)
        .set({ quantity: sql`${wines.quantity} - ${total}` })
        .where(eq(wines.id, tw.wineId));
    }
  },

  createBundleWithWines(
    shopId: string,
    productData: { name: string; description?: string; price: string; quantity: number },
    wineList: { wineId: string; quantity: number }[]
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      for (const item of wineList) {
        const totalNeeded = item.quantity * productData.quantity;
        const [wine] = await tx
          .select({ quantity: wines.quantity })
          .from(wines)
          .where(and(eq(wines.id, item.wineId), isNull(wines.deletedAt)))
          .for("update");

        if (!wine) throw new Error("INVALID_WINE");
        if (wine.quantity < totalNeeded) throw new Error("NOT_ENOUGH_STOCK");

        await tx
          .update(wines)
          .set({ quantity: sql`${wines.quantity} - ${totalNeeded}` })
          .where(eq(wines.id, item.wineId));
      }

      const values: NewProduct = {
        description: productData.description ?? null,
        isBundle: true,
        name: productData.name,
        price: productData.price,
        quantity: productData.quantity,
        shopId,
      };
      const [product] = await tx.insert(products).values(values).returning();
      if (!product) throw new Error("Product insert returned no rows");

      const pwRows: NewProductWine[] = wineList.map((w) => ({
        productId: product.id,
        quantity: w.quantity,
        wineId: w.wineId,
      }));
      await tx.insert(productWines).values(pwRows);

      return product;
    });
  },

  createProductWithWine(
    shopId: string,
    productData: { name: string; description?: string; price: string; quantity: number },
    wineId: string
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const [wine] = await tx
        .select({ quantity: wines.quantity })
        .from(wines)
        .where(and(eq(wines.id, wineId), isNull(wines.deletedAt)))
        .for("update");

      if (!wine) throw new Error("INVALID_WINE");
      if (wine.quantity < productData.quantity) throw new Error("NOT_ENOUGH_STOCK");

      await tx
        .update(wines)
        .set({ quantity: sql`${wines.quantity} - ${productData.quantity}` })
        .where(eq(wines.id, wineId));

      const values: NewProduct = {
        description: productData.description ?? null,
        isBundle: false,
        name: productData.name,
        price: productData.price,
        quantity: productData.quantity,
        shopId,
      };
      const [product] = await tx.insert(products).values(values).returning();
      if (!product) throw new Error("Product insert returned no rows");

      const pw: NewProductWine = { productId: product.id, quantity: 1, wineId };
      await tx.insert(productWines).values(pw);

      return product;
    });
  },

  async decrementStock(tx: Transaction, productId: string, quantity: number): Promise<void> {
    const product = await tx.query.products.findFirst({
      where: eq(products.id, productId),
      with: { productWines: true },
    });

    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (product.quantity < quantity) throw new Error("INSUFFICIENT_STOCK");

    // Decrement product quantity
    await tx
      .update(products)
      .set({ quantity: sql`${products.quantity} - ${quantity}` })
      .where(eq(products.id, productId));

    // Decrement underlying wine quantities
    for (const pw of product.productWines) {
      const totalWineNeeded = pw.quantity * quantity;
      await tx
        .update(wines)
        .set({ quantity: sql`${wines.quantity} - ${totalWineNeeded}` })
        .where(eq(wines.id, pw.wineId));
    }
  },

  async findAll(
    filters: ProductCatalogFilters,
    pagination: { limit: number; offset: number }
  ): Promise<{ rows: CatalogRow[]; total: number }> {
    const conditions: SQL[] = [isNull(products.deletedAt), isNull(shops.deletedAt)];

    if (filters.minPrice !== undefined) {
      conditions.push(sql`${products.price} >= ${filters.minPrice}`);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
    }
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      const searchCond = or(
        ilike(products.name, pattern),
        sql`EXISTS (
          SELECT 1 FROM product_wines pw
          JOIN wines w ON pw.wine_id = w.id
          WHERE pw.product_id = ${products.id}
            AND w.name ILIKE ${pattern}
            AND w.deleted_at IS NULL
        )`
      );
      if (searchCond) {
        conditions.push(searchCond);
      }
    }
    if (filters.type) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM product_wines pw
        JOIN wines w ON pw.wine_id = w.id
        WHERE pw.product_id = ${products.id}
          AND w.type = ${filters.type}
          AND w.deleted_at IS NULL
      )`);
    }
    if (filters.color) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM product_wines pw
        JOIN wines w ON pw.wine_id = w.id
        WHERE pw.product_id = ${products.id}
          AND w.color = ${filters.color}
          AND w.deleted_at IS NULL
      )`);
    }
    if (filters.region) {
      const regionPattern = `%${filters.region}%`;
      conditions.push(sql`EXISTS (
        SELECT 1 FROM product_wines pw
        JOIN wines w ON pw.wine_id = w.id
        WHERE pw.product_id = ${products.id}
          AND w.region ILIKE ${regionPattern}
          AND w.deleted_at IS NULL
      )`);
    }

    const reviewsJoinCond = and(
      eq(reviews.entityId, products.id),
      eq(reviews.entityType, "product"),
      isNull(reviews.deletedAt)
    );

    const orderByExpr = (() => {
      switch (filters.sort) {
        case "price-asc":
          return asc(products.price);
        case "price-desc":
          return desc(products.price);
        case "rating":
          return sql`AVG(${reviews.rating}) DESC NULLS LAST`;
        default:
          return desc(products.createdAt);
      }
    })();

    const having =
      filters.rating !== undefined ? sql`AVG(${reviews.rating}) >= ${filters.rating}` : undefined;

    const baseSelect = db
      .select({
        avgRating: sql<string | null>`AVG(${reviews.rating})`,
        id: products.id,
        isBundle: products.isBundle,
        name: products.name,
        price: products.price,
        quantity: products.quantity,
        reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})::int`,
        shopId: products.shopId,
        shopName: shops.name,
      })
      .from(products)
      .innerJoin(shops, eq(products.shopId, shops.id))
      .leftJoin(reviews, reviewsJoinCond)
      .where(and(...conditions))
      .groupBy(products.id, shops.id);

    // biome-ignore lint/suspicious/noExplicitAny: Drizzle's .having() returns a narrower type; cast to keep chaining uniform
    const rowsQuery: any = having ? baseSelect.having(having) : baseSelect;

    const countBase = db
      .select({ id: products.id })
      .from(products)
      .innerJoin(shops, eq(products.shopId, shops.id))
      .leftJoin(reviews, reviewsJoinCond)
      .where(and(...conditions))
      .groupBy(products.id, shops.id);

    // biome-ignore lint/suspicious/noExplicitAny: same reason as rowsQuery
    const countSubq = ((having ? countBase.having(having) : countBase) as any).as("subq");

    const [rows, [countResult]] = await Promise.all([
      rowsQuery.orderBy(orderByExpr).limit(pagination.limit).offset(pagination.offset),
      db.select({ total: sql<number>`COUNT(*)::int` }).from(countSubq),
    ]);

    return { rows, total: countResult?.total ?? 0 };
  },

  async findById(id: string): Promise<ProductWithWines | undefined> {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), isNull(products.deletedAt)),
      with: {
        productWines: {
          with: {
            wine: {
              columns: {
                alcoholContent: true,
                color: true,
                deletedAt: true,
                id: true,
                name: true,
                type: true,
                vintageYear: true,
                volumeMl: true,
              },
            },
          },
        },
      },
    });

    if (product) {
      const typedProduct = product as unknown as ProductWithWines;
      if (typedProduct.productWines) {
        typedProduct.productWines = typedProduct.productWines.filter(
          (pw) => pw.wine && !pw.wine.deletedAt
        );
      }
      return typedProduct;
    }
    return undefined;
  },

  findByIds(ids: string[]): Promise<ProductWithWinesAndWinemaker[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return db.query.products.findMany({
      where: and(inArray(products.id, ids), isNull(products.deletedAt)),
      with: {
        productWines: {
          with: {
            wine: {
              columns: {
                color: true,
                id: true,
                name: true,
                region: true,
                type: true,
                vintageYear: true,
              },
              with: {
                winemaker: { columns: { name: true } },
              },
            },
          },
        },
      },
    }) as Promise<ProductWithWinesAndWinemaker[]>;
  },

  findByShopId(shopId: string, isBundle?: boolean): Promise<ProductWithWines[]> {
    return db.query.products.findMany({
      where: and(
        eq(products.shopId, shopId),
        isNull(products.deletedAt),
        isBundle !== undefined ? eq(products.isBundle, isBundle) : undefined
      ),
      with: {
        productWines: {
          with: {
            wine: {
              columns: {
                alcoholContent: true,
                color: true,
                deletedAt: true,
                id: true,
                name: true,
                type: true,
                vintageYear: true,
                volumeMl: true,
              },
            },
          },
        },
      },
    }) as Promise<ProductWithWines[]>;
  },

  async handleSameWineQuantityChange(
    tx: Transaction,
    wineId: string,
    oldQty: number,
    newQty: number
  ) {
    const diff = newQty - oldQty;
    if (diff === 0) return;

    const [wine] = await tx
      .select({ quantity: wines.quantity })
      .from(wines)
      .where(eq(wines.id, wineId))
      .for("update");
    if (!wine) throw new Error("INVALID_WINE");
    if (wine.quantity < diff) throw new Error("NOT_ENOUGH_STOCK");

    await tx
      .update(wines)
      .set({ quantity: sql`${wines.quantity} - ${diff}` })
      .where(eq(wines.id, wineId));
  },

  async handleWineIdChange(
    tx: Transaction,
    oldId: string,
    oldQty: number,
    newId: string,
    newQty: number
  ) {
    await tx
      .update(wines)
      .set({ quantity: sql`${wines.quantity} + ${oldQty}` })
      .where(eq(wines.id, oldId));

    const [wine] = await tx
      .select({ quantity: wines.quantity })
      .from(wines)
      .where(eq(wines.id, newId))
      .for("update");
    if (!wine) throw new Error("INVALID_WINE");
    if (wine.quantity < newQty) throw new Error("NOT_ENOUGH_STOCK");

    await tx
      .update(wines)
      .set({ quantity: sql`${wines.quantity} - ${newQty}` })
      .where(eq(wines.id, newId));
  },

  async isDeleted(id: string): Promise<boolean> {
    const product = await db.query.products.findFirst({
      columns: { deletedAt: true },
      where: eq(products.id, id),
    });
    return product?.deletedAt !== null && product?.deletedAt !== undefined;
  },

  async productIdsExist(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const uniqueIds = [...new Set(ids)];
    const found = await db.query.products.findMany({
      columns: { id: true },
      where: and(inArray(products.id, uniqueIds), isNull(products.deletedAt)),
    });
    return found.length === uniqueIds.length;
  },

  async revertBundleAllocations(
    tx: Transaction,
    product: Product & { productWines: ProductWine[] }
  ) {
    for (const pw of product.productWines) {
      await tx
        .update(wines)
        .set({ quantity: sql`${wines.quantity} + ${pw.quantity * product.quantity}` })
        .where(eq(wines.id, pw.wineId));
    }
  },

  async softDelete(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, id),
        with: { productWines: true },
      });
      if (product) {
        await this.revertBundleAllocations(tx as Transaction, product);
      }
      await tx.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id));
    });
  },

  async updateBundle(
    id: string,
    fields: { name?: string; description?: string | null; price?: string; quantity?: number },
    newWines?: { wineId: string; quantity: number }[]
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const current = await tx.query.products.findFirst({
        where: eq(products.id, id),
        with: { productWines: true },
      });
      if (!current) throw new Error("Product not found");

      await this.revertBundleAllocations(tx as Transaction, current);

      const targetWines = newWines ?? current.productWines;
      const newQty = fields.quantity ?? current.quantity;
      await this.applyBundleAllocations(tx as Transaction, targetWines, newQty);

      const [updated] = await tx
        .update(products)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();

      if (newWines !== undefined) {
        await tx.delete(productWines).where(eq(productWines.productId, id));
        const pwRows: NewProductWine[] = newWines.map((w) => ({
          productId: id,
          quantity: w.quantity,
          wineId: w.wineId,
        }));
        await tx.insert(productWines).values(pwRows);
      }

      if (!updated) throw new Error("Product not found");
      return updated;
    });
  },

  async updateProduct(
    id: string,
    fields: { name?: string; description?: string | null; price?: string; quantity?: number },
    newWineId?: string
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const current = await tx.query.products.findFirst({
        where: eq(products.id, id),
        with: { productWines: true },
      });
      if (!current) throw new Error("Product not found");

      const currentQty = current.quantity;
      const newQty = fields.quantity ?? currentQty;
      const currentWineId = current.productWines[0]?.wineId;
      const targetWineId = newWineId ?? currentWineId;

      if (!(currentWineId && targetWineId)) throw new Error("INCONSISTENT_DATA");

      if (targetWineId === currentWineId) {
        await this.handleSameWineQuantityChange(
          tx as Transaction,
          currentWineId,
          currentQty,
          newQty
        );
      } else {
        await this.handleWineIdChange(
          tx as Transaction,
          currentWineId,
          currentQty,
          targetWineId,
          newQty
        );
      }

      const [updated] = await tx
        .update(products)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      if (!updated) throw new Error("Product not found");

      if (newWineId !== undefined) {
        await tx.delete(productWines).where(eq(productWines.productId, id));
        await tx.insert(productWines).values({ productId: id, quantity: 1, wineId: newWineId });
      }

      return updated;
    });
  },

  async winesExist(wineIds: string[]): Promise<boolean> {
    const uniqueIds = [...new Set(wineIds)];
    const found = await db.query.wines.findMany({
      columns: { id: true },
      where: and(inArray(wines.id, uniqueIds), isNull(wines.deletedAt)),
    });
    return found.length === uniqueIds.length;
  },
>>>>>>> origin/main
};
