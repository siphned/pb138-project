import type { NewProduct, NewProductWine, Product, ProductWine, Wine } from "@repo/shared/schemas";
import { products, productWines, reviews, shops, wines } from "@repo/shared/schemas";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import type { Database } from "../../db";

export type WineInfo = Pick<
  Wine,
  "id" | "name" | "type" | "color" | "vintageYear" | "alcoholContent" | "volumeMl" | "deletedAt"
> & {
  winemaker: { id: string; name: string };
};

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
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  color?: string;
  region?: string;
  rating?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  q?: string;
  wineId?: string;
  shopId?: string;
  isBundle?: boolean;
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
  await db
    .update(products)
    .set({
      quantity: sql`${products.quantity} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
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

export async function findAll(
  db: Database,
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
  if (filters.shopId !== undefined) {
    conditions.push(eq(products.shopId, filters.shopId));
  }
  if (filters.isBundle !== undefined) {
    conditions.push(eq(products.isBundle, filters.isBundle));
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
  quantitySql: SQL
): Promise<void> {
  await db.update(wines).set({ quantity: quantitySql }).where(eq(wines.id, wineId));
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
};
