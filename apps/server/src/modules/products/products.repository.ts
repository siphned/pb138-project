import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../../db";
import type { NewProduct, NewProductWine, Product, ProductWine, Wine } from "../../db/schema";
import { products, productWines, wines } from "../../db/schema";

export type WineInfo = Pick<
  Wine,
  "id" | "name" | "type" | "color" | "vintageYear" | "alcoholContent" | "volumeMl" | "deletedAt"
>;

export type ProductWineWithInfo = ProductWine & { wine: WineInfo };

export type ProductWithWines = Product & { productWines: ProductWineWithInfo[] };

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const productsRepository = {
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
};
