import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { AvailabilityException, AvailabilityRegular } from "../../db/schema";
import { availabilityExceptions, availabilityRegular, shops } from "../../db/schema";

export const availabilityRepository = {
  findRegularByShopId(shopId: string): Promise<AvailabilityRegular[]> {
    return db.query.availabilityRegular.findMany({
      where: eq(availabilityRegular.shopId, shopId),
    });
  },

  findExceptionsByShopId(shopId: string): Promise<AvailabilityException[]> {
    return db.query.availabilityExceptions.findMany({
      where: eq(availabilityExceptions.shopId, shopId),
    });
  },

  findShopById(id: string) {
    return db.query.shops.findFirst({
      where: and(eq(shops.id, id), isNull(shops.deletedAt)),
    });
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

  async deleteRegular(id: string): Promise<void> {
    await db.delete(availabilityRegular).where(eq(availabilityRegular.id, id));
  },

  async deleteException(id: string): Promise<void> {
    await db.delete(availabilityExceptions).where(eq(availabilityExceptions.id, id));
  },

  findRegularById(id: string): Promise<AvailabilityRegular | undefined> {
    return db.query.availabilityRegular.findFirst({
      where: eq(availabilityRegular.id, id),
    });
  },

  findExceptionById(id: string): Promise<AvailabilityException | undefined> {
    return db.query.availabilityExceptions.findFirst({
      where: eq(availabilityExceptions.id, id),
    });
  },
};
