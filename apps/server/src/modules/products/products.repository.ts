import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { productWines, products, wines } from '../../db/schema'
import type { NewProduct, NewProductWine, Product, ProductWine, Wine } from '../../db/schema'

export type WineInfo = Pick<Wine, 'id' | 'name' | 'type' | 'color' | 'vintageYear' | 'alcoholContent' | 'volumeMl'>

export type ProductWineWithInfo = ProductWine & { wine: WineInfo }

export type ProductWithWines = Product & { productWines: ProductWineWithInfo[] }

export const productsRepository = {
  findById(id: string): Promise<ProductWithWines | undefined> {
    return db.query.products.findFirst({
      where: and(eq(products.id, id), isNull(products.deletedAt)),
      with: {
        productWines: {
          with: { wine: { columns: { id: true, name: true, type: true, color: true, vintageYear: true, alcoholContent: true, volumeMl: true } } },
        },
      },
    }) as Promise<ProductWithWines | undefined>
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
          with: { wine: { columns: { id: true, name: true, type: true, color: true, vintageYear: true, alcoholContent: true, volumeMl: true } } },
        },
      },
    }) as Promise<ProductWithWines[]>
  },

  async winesExist(wineIds: string[]): Promise<boolean> {
    const found = await db.query.wines.findMany({
      where: and(inArray(wines.id, wineIds), isNull(wines.deletedAt)),
      columns: { id: true },
    })
    return found.length === wineIds.length
  },

  async createProductWithWine(
    shopId: string,
    productData: { name: string; description?: string; price: string; quantity: number },
    wineId: string
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const values: NewProduct = {
        shopId,
        name: productData.name,
        description: productData.description ?? null,
        price: productData.price,
        quantity: productData.quantity,
        isBundle: false,
      }
      const [product] = await tx.insert(products).values(values).returning()
      if (!product) throw new Error('Product insert returned no rows')

      const pw: NewProductWine = { productId: product.id, wineId, quantity: 1 }
      await tx.insert(productWines).values(pw)

      return product
    })
  },

  async createBundleWithWines(
    shopId: string,
    productData: { name: string; description?: string; price: string; quantity: number },
    wineList: { wineId: string; quantity: number }[]
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const values: NewProduct = {
        shopId,
        name: productData.name,
        description: productData.description ?? null,
        price: productData.price,
        quantity: productData.quantity,
        isBundle: true,
      }
      const [product] = await tx.insert(products).values(values).returning()
      if (!product) throw new Error('Product insert returned no rows')

      const pwRows: NewProductWine[] = wineList.map((w) => ({
        productId: product.id,
        wineId: w.wineId,
        quantity: w.quantity,
      }))
      await tx.insert(productWines).values(pwRows)

      return product
    })
  },

  async updateProduct(
    id: string,
    fields: { name?: string; description?: string | null; price?: string; quantity?: number },
    newWineId?: string
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()
      if (!updated) throw new Error('Product not found')

      if (newWineId !== undefined) {
        await tx.delete(productWines).where(eq(productWines.productId, id))
        await tx.insert(productWines).values({ productId: id, wineId: newWineId, quantity: 1 })
      }

      return updated
    })
  },

  async updateBundle(
    id: string,
    fields: { name?: string; description?: string | null; price?: string; quantity?: number },
    newWines?: { wineId: string; quantity: number }[]
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()
      if (!updated) throw new Error('Product not found')

      if (newWines !== undefined) {
        await tx.delete(productWines).where(eq(productWines.productId, id))
        const pwRows: NewProductWine[] = newWines.map((w) => ({
          productId: id,
          wineId: w.wineId,
          quantity: w.quantity,
        }))
        await tx.insert(productWines).values(pwRows)
      }

      return updated
    })
  },

  async softDelete(id: string): Promise<void> {
    await db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id))
  },
}
