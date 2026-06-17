import type { Address, Wine, Winemaker } from "@repo/shared/schemas";
import { addresses, events, winemakers, wines } from "@repo/shared/schemas";
import { and, eq, ilike, isNull, sql } from "drizzle-orm";
import type { Database } from "../../db";
import { primaryImageUrlSql } from "../images/images.sql";

export type EventRow = {
  id: string;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  visibility: "public" | "private";
  inviteType: string;
  createdAt: Date;
};

export type WinemakerListItem = Winemaker & { address: Address; imageUrl?: string | null };

export type WinemakerWithRelations = Winemaker & {
  address: Address;
  wines: Wine[];
  events: EventRow[];
};

export type UpdateWinemakerData = {
  name?: string;
  description?: string;
  websiteUrl?: string | null;
  email?: string;
  phone?: string;
};

type AddressData = {
  country: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
};

export async function insertAddress(db: Database, data: AddressData): Promise<Address> {
  const [address] = await db.insert(addresses).values(data).returning();
  if (!address) throw new Error("Address insert returned no rows");
  return address;
}

export async function createWinemaker(
  db: Database,
  data: {
    userId: string;
    name: string;
    description: string;
    addressId: string;
    email?: string;
    phone?: string;
    websiteUrl?: string;
  }
): Promise<Winemaker> {
  const [winemaker] = await db.insert(winemakers).values(data).returning();
  if (!winemaker) throw new Error("Winemaker insert returned no rows");
  return winemaker;
}

export async function findAll(
  db: Database,
  filters: { q?: string; city?: string },
  pagination: { limit: number; offset: number }
): Promise<{ rows: WinemakerListItem[]; total: number }> {
  const conditions = [isNull(winemakers.deletedAt)];
  if (filters.q) conditions.push(ilike(winemakers.name, `%${filters.q}%`));

  // Filter by city and address non-deleted at the DB level so pagination counts are accurate.
  if (filters.city) {
    const pattern = `%${filters.city}%`;
    conditions.push(
      sql`${winemakers.addressId} IN (SELECT id FROM addresses WHERE city ILIKE ${pattern} AND deleted_at IS NULL)`
    );
  } else {
    conditions.push(
      sql`${winemakers.addressId} IN (SELECT id FROM addresses WHERE deleted_at IS NULL)`
    );
  }

  const where = and(...conditions);

  const [rows, [countResult]] = await Promise.all([
    db.query.winemakers.findMany({
      extras: { imageUrl: primaryImageUrlSql("winemaker", winemakers.id).as("image_url") },
      limit: pagination.limit,
      offset: pagination.offset,
      where,
      with: { address: true },
    }),
    db.select({ total: sql<number>`COUNT(*)::int` }).from(winemakers).where(where),
  ]);

  return { rows: rows as WinemakerListItem[], total: countResult?.total ?? 0 };
}

export async function findById(
  db: Database,
  id: string
): Promise<WinemakerWithRelations | undefined> {
  const result = await db.query.winemakers.findFirst({
    where: and(eq(winemakers.id, id), isNull(winemakers.deletedAt)),
    with: {
      address: true,
      events: { where: isNull(events.deletedAt) },
      wines: { where: isNull(wines.deletedAt) },
    },
  });

  if (result?.address && !result.address.deletedAt) {
    return result as WinemakerWithRelations;
  }
  return undefined;
}

export async function findByIdWithAddress(
  db: Database,
  id: string
): Promise<WinemakerListItem | undefined> {
  const result = await db.query.winemakers.findFirst({
    where: and(eq(winemakers.id, id), isNull(winemakers.deletedAt)),
    with: { address: true },
  });

  if (result?.address && !result.address.deletedAt) {
    return result as WinemakerListItem;
  }
  return undefined;
}

export async function findByUserId(db: Database, userId: string): Promise<Winemaker | undefined> {
  return db.query.winemakers.findFirst({
    where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
  });
}

export async function findEventsByWinemakerId(
  db: Database,
  winemakerId: string
): Promise<EventRow[]> {
  return db.query.events.findMany({
    where: and(eq(events.winemakerId, winemakerId), isNull(events.deletedAt)),
  }) as Promise<EventRow[]>;
}

export async function findWinesByWinemakerId(db: Database, winemakerId: string): Promise<Wine[]> {
  return db.query.wines.findMany({
    where: and(eq(wines.winemakerId, winemakerId), isNull(wines.deletedAt)),
  });
}

export async function updateById(
  db: Database,
  id: string,
  data: UpdateWinemakerData
): Promise<Winemaker> {
  const [updated] = await db
    .update(winemakers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(winemakers.id, id))
    .returning();
  if (!updated) throw new Error("Winemaker not found");
  return updated;
}

export const winemakersRepository = {
  findAll,
  findById,
  findByIdWithAddress,
  findByUserId,
  findEventsByWinemakerId,
  findWinesByWinemakerId,
  updateById,
};
