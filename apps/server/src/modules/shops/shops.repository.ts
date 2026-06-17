import type { Address, Shop } from "@repo/shared/schemas";
import { addresses, shops } from "@repo/shared/schemas";
import { and, eq, ilike, isNull, sql } from "drizzle-orm";
import type { Database } from "../../db";
import { primaryImageUrlSql } from "../images/images.sql";

export type ShopWithAddress = Shop & { address: Address; imageUrl?: string | null };

type AddressData = {
  country: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
};

export async function createShop(
  db: Database,
  data: { ownerUserId: string; name: string; description: string; addressId: string }
): Promise<Shop> {
  const [shop] = await db.insert(shops).values(data).returning();
  if (!shop) throw new Error("Shop insert returned no rows");
  return shop;
}

export async function insertAddress(db: Database, data: AddressData): Promise<Address> {
  const [address] = await db.insert(addresses).values(data).returning();
  if (!address) throw new Error("Address insert returned no rows");
  return address;
}

export async function findAll(
  db: Database,
  filters: { q?: string; city?: string; ownerUserId?: string },
  pagination: { limit: number; offset: number }
): Promise<{ rows: ShopWithAddress[]; total: number }> {
  const conditions = [isNull(shops.deletedAt)];
  if (filters.q) conditions.push(ilike(shops.name, `%${filters.q}%`));
  if (filters.ownerUserId) conditions.push(eq(shops.ownerUserId, filters.ownerUserId));

  // Filter by city and address non-deleted at the DB level so pagination counts are accurate.
  if (filters.city) {
    const pattern = `%${filters.city}%`;
    conditions.push(
      sql`${shops.addressId} IN (SELECT id FROM addresses WHERE city ILIKE ${pattern} AND deleted_at IS NULL)`
    );
  } else {
    conditions.push(sql`${shops.addressId} IN (SELECT id FROM addresses WHERE deleted_at IS NULL)`);
  }

  const where = and(...conditions);

  const [rows, [countResult]] = await Promise.all([
    db.query.shops.findMany({
      extras: { imageUrl: primaryImageUrlSql("shop", shops.id).as("image_url") },
      limit: pagination.limit,
      offset: pagination.offset,
      where,
      with: { address: true },
    }),
    db.select({ total: sql<number>`COUNT(*)::int` }).from(shops).where(where),
  ]);

  return { rows: rows as ShopWithAddress[], total: countResult?.total ?? 0 };
}

export async function findAllByOwnerUserId(
  db: Database,
  ownerUserId: string
): Promise<ShopWithAddress[]> {
  const rows = await db.query.shops.findMany({
    where: and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)),
    with: { address: true },
  });
  return rows.filter((r) => r.address && !r.address.deletedAt) as ShopWithAddress[];
}

export async function findById(db: Database, id: string): Promise<ShopWithAddress | undefined> {
  const result = await db.query.shops.findFirst({
    where: and(eq(shops.id, id), isNull(shops.deletedAt)),
    with: {
      address: true,
    },
  });

  if (result?.address && !result.address.deletedAt) {
    return result as ShopWithAddress;
  }
  return undefined;
}

export async function findByOwnerUserId(
  db: Database,
  ownerUserId: string
): Promise<Shop | undefined> {
  return db.query.shops.findFirst({
    where: and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)),
  });
}

export async function softDeleteById(db: Database, id: string): Promise<void> {
  await db.update(shops).set({ deletedAt: new Date() }).where(eq(shops.id, id));
}

export async function updateById(
  db: Database,
  id: string,
  data: { name?: string; description?: string; addressId?: string }
): Promise<Shop> {
  const [updated] = await db
    .update(shops)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(shops.id, id))
    .returning();
  if (!updated) throw new Error("Shop not found");
  return updated;
}
