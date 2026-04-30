import type { Image } from "@repo/shared/schemas";
import { events, images, products, shops, winemakers, wines } from "@repo/shared/schemas";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { VALID_ENTITY_TYPES } from "./images.schema";

export type EntityType = (typeof VALID_ENTITY_TYPES)[number];

export interface IImagesRepository {
  countByEntity(entityType: EntityType, entityId: string): Promise<number>;
  entityExists(entityType: EntityType, entityId: string): Promise<boolean>;
  findByEntity(entityType: EntityType, entityId: string): Promise<Image[]>;
  findById(id: string): Promise<Image | undefined>;
  findByUrl(url: string): Promise<Image | undefined>;
  findOwnerUserId(entityType: EntityType, entityId: string): Promise<string | undefined>;
  insert(data: { entityId: string; entityType: EntityType; url: string }): Promise<Image>;
  softDelete(id: string): Promise<void>;
}

export const imagesRepository: IImagesRepository = {
  async countByEntity(entityType, entityId) {
    const [result] = await db
      .select({ value: count() })
      .from(images)
      .where(
        and(
          eq(images.entityType, entityType),
          eq(images.entityId, entityId),
          isNull(images.deletedAt)
        )
      );
    return result?.value ?? 0;
  },
  async entityExists(entityType, entityId) {
    switch (entityType) {
      case "event": {
        const r = await db.query.events.findFirst({
          columns: { id: true },
          where: and(eq(events.id, entityId), isNull(events.deletedAt)),
        });
        return !!r;
      }
      case "product": {
        const r = await db.query.products.findFirst({
          columns: { id: true },
          where: and(eq(products.id, entityId), isNull(products.deletedAt)),
        });
        return !!r;
      }
      case "shop": {
        const r = await db.query.shops.findFirst({
          columns: { id: true },
          where: and(eq(shops.id, entityId), isNull(shops.deletedAt)),
        });
        return !!r;
      }
      case "wine": {
        const r = await db.query.wines.findFirst({
          columns: { id: true },
          where: and(eq(wines.id, entityId), isNull(wines.deletedAt)),
        });
        return !!r;
      }
      case "winemaker": {
        const r = await db.query.winemakers.findFirst({
          columns: { id: true },
          where: and(eq(winemakers.id, entityId), isNull(winemakers.deletedAt)),
        });
        return !!r;
      }
    }
  },

  findByEntity(entityType, entityId) {
    return db.query.images.findMany({
      where: and(
        eq(images.entityType, entityType),
        eq(images.entityId, entityId),
        isNull(images.deletedAt)
      ),
    });
  },

  findById(id) {
    return db.query.images.findFirst({
      where: and(eq(images.id, id), isNull(images.deletedAt)),
    }) as Promise<Image | undefined>;
  },

  findByUrl(url) {
    return db.query.images.findFirst({
      where: and(eq(images.url, url), isNull(images.deletedAt)),
    }) as Promise<Image | undefined>;
  },

  async findOwnerUserId(entityType, entityId) {
    switch (entityType) {
      case "event": {
        const event = await db.query.events.findFirst({
          where: and(eq(events.id, entityId), isNull(events.deletedAt)),
          with: { winemaker: { columns: { deletedAt: true, userId: true } } },
        });
        if (!event?.winemaker || event.winemaker.deletedAt) return undefined;
        return event.winemaker.userId;
      }
      case "product": {
        const product = await db.query.products.findFirst({
          where: and(eq(products.id, entityId), isNull(products.deletedAt)),
          with: { shop: { columns: { deletedAt: true, ownerUserId: true } } },
        });
        if (!product?.shop || product.shop.deletedAt) return undefined;
        return product.shop.ownerUserId;
      }
      case "shop": {
        const shop = await db.query.shops.findFirst({
          columns: { ownerUserId: true },
          where: and(eq(shops.id, entityId), isNull(shops.deletedAt)),
        });
        return shop?.ownerUserId;
      }
      case "wine": {
        const wine = await db.query.wines.findFirst({
          where: and(eq(wines.id, entityId), isNull(wines.deletedAt)),
          with: { winemaker: { columns: { deletedAt: true, userId: true } } },
        });
        if (!wine?.winemaker || wine.winemaker.deletedAt) return undefined;
        return wine.winemaker.userId;
      }
      case "winemaker": {
        const winemaker = await db.query.winemakers.findFirst({
          columns: { userId: true },
          where: and(eq(winemakers.id, entityId), isNull(winemakers.deletedAt)),
        });
        return winemaker?.userId;
      }
    }
  },

  async insert(data) {
    const [image] = await db.insert(images).values(data).returning();
    if (!image) throw new Error("Image insert returned no rows");
    return image;
  },

  async softDelete(id) {
    await db.update(images).set({ deletedAt: new Date() }).where(eq(images.id, id));
  },
};
