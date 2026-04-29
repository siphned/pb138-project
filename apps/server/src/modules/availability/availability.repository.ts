import type { AvailabilityException, AvailabilityRegular } from "@repo/shared/schemas";
import { availabilityExceptions, availabilityRegular, shops } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";

export const availabilityRepository = {
  async deleteException(id: string): Promise<void> {
    await db.delete(availabilityExceptions).where(eq(availabilityExceptions.id, id));
  },

  async deleteRegular(id: string): Promise<void> {
    await db.delete(availabilityRegular).where(eq(availabilityRegular.id, id));
  },

  findExceptionById(id: string): Promise<AvailabilityException | undefined> {
    return db.query.availabilityExceptions.findFirst({
      where: and(eq(availabilityExceptions.id, id), isNull(availabilityExceptions.deletedAt)),
    });
  },

  findExceptionsByShopId(shopId: string): Promise<AvailabilityException[]> {
    return db.query.availabilityExceptions.findMany({
      where: eq(availabilityExceptions.shopId, shopId),
    });
  },

  findRegularById(id: string): Promise<AvailabilityRegular | undefined> {
    return db.query.availabilityRegular.findFirst({
      where: and(eq(availabilityRegular.id, id), isNull(availabilityRegular.deletedAt)),
    });
  },
  findRegularByShopId(shopId: string): Promise<AvailabilityRegular[]> {
    return db.query.availabilityRegular.findMany({
      where: eq(availabilityRegular.shopId, shopId),
    });
  },

  findShopById(id: string) {
    return db.query.shops.findFirst({
      where: and(eq(shops.id, id), isNull(shops.deletedAt)),
    });
  },

  async insertException(data: {
    shopId: string;
    startsAt: Date;
    endsAt: Date;
    action: string;
    reason?: string;
  }): Promise<AvailabilityException> {
    const [entry] = await db.insert(availabilityExceptions).values(data).returning();
    if (!entry) throw new Error("Insert returned no rows");
    return entry;
  },

  async insertRegular(data: {
    shopId: string;
    dow: number;
    startTime: Date;
    endTime: Date;
    validFrom: string;
    validTo?: string;
    type: string;
  }): Promise<AvailabilityRegular> {
    const [entry] = await db.insert(availabilityRegular).values(data).returning();
    if (!entry) throw new Error("Insert returned no rows");
    return entry;
  },
};
