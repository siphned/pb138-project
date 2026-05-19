import type { AvailabilityException, AvailabilityRegular } from "@repo/shared/schemas";
import { availabilityExceptions, availabilityRegular, shops } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "../../db";

export async function deleteException(db: Database, id: string): Promise<void> {
  await db
    .update(availabilityExceptions)
    .set({ deletedAt: new Date() })
    .where(eq(availabilityExceptions.id, id));
}

export async function deleteRegular(db: Database, id: string): Promise<void> {
  await db
    .update(availabilityRegular)
    .set({ deletedAt: new Date() })
    .where(eq(availabilityRegular.id, id));
}

export async function findExceptionById(
  db: Database,
  id: string
): Promise<AvailabilityException | undefined> {
  return db.query.availabilityExceptions.findFirst({
    where: and(eq(availabilityExceptions.id, id), isNull(availabilityExceptions.deletedAt)),
  });
}

export async function findExceptionsByShopId(
  db: Database,
  shopId: string
): Promise<AvailabilityException[]> {
  return db.query.availabilityExceptions.findMany({
    where: and(eq(availabilityExceptions.shopId, shopId), isNull(availabilityExceptions.deletedAt)),
  });
}

export async function findRegularById(
  db: Database,
  id: string
): Promise<AvailabilityRegular | undefined> {
  return db.query.availabilityRegular.findFirst({
    where: and(eq(availabilityRegular.id, id), isNull(availabilityRegular.deletedAt)),
  });
}

export async function findRegularByShopId(
  db: Database,
  shopId: string
): Promise<AvailabilityRegular[]> {
  return db.query.availabilityRegular.findMany({
    where: and(eq(availabilityRegular.shopId, shopId), isNull(availabilityRegular.deletedAt)),
  });
}

export async function findShopById(db: Database, id: string) {
  return db.query.shops.findFirst({
    columns: { id: true, ownerUserId: true },
    where: and(eq(shops.id, id), isNull(shops.deletedAt)),
  });
}

export async function insertException(
  db: Database,
  data: {
    shopId: string;
    startsAt: Date;
    endsAt: Date;
    action: string;
    reason?: string;
  }
): Promise<AvailabilityException> {
  const [entry] = await db.insert(availabilityExceptions).values(data).returning();
  if (!entry) throw new Error("Insert returned no rows");
  return entry;
}

export async function insertRegular(
  db: Database,
  data: {
    shopId: string;
    dow: number;
    startTime: Date;
    endTime: Date;
    validFrom: string;
    validTo?: string;
    type: string;
  }
): Promise<AvailabilityRegular> {
  const [entry] = await db.insert(availabilityRegular).values(data).returning();
  if (!entry) throw new Error("Insert returned no rows");
  return entry;
}
