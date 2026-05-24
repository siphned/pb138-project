import type { Wine, Winemaker } from "@repo/shared/schemas";
import { winemakers, wines } from "@repo/shared/schemas";
<<<<<<< HEAD
import { and, eq, ilike, isNull } from "drizzle-orm";
import type { Database } from "../../db";
=======
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
>>>>>>> origin/main

export type WineWithWinemaker = Wine & {
  winemaker: { id: string; name: string };
};

export type WineData = {
  name: string;
  description: string;
  composition: string;
  attribution: string;
  region: string;
  vintageYear: number;
  type: "still" | "sparkling" | "fortified" | "dessert";
  color: "red" | "white" | "rosé" | "orange" | "gray" | "tawny" | "yellow";
  alcoholContent: string;
  volumeMl: number;
  quantity: number;
};

export type WineFilters = {
<<<<<<< HEAD
  color?: string;
  q?: string;
  region?: string;
  type?: string;
=======
  region?: string;
  type?: string;
  color?: string;
>>>>>>> origin/main
  vintageYear?: number;
  winemakerId?: string;
};

<<<<<<< HEAD
export async function findAll(db: Database, filters: WineFilters): Promise<WineWithWinemaker[]> {
  const conditions = [isNull(wines.deletedAt)];
  if (filters.q) conditions.push(ilike(wines.name, `%${filters.q}%`));
  if (filters.region) conditions.push(eq(wines.region, filters.region));
  if (filters.type) conditions.push(eq(wines.type, filters.type as WineData["type"]));
  if (filters.color) conditions.push(eq(wines.color, filters.color as WineData["color"]));
  if (filters.vintageYear) conditions.push(eq(wines.vintageYear, filters.vintageYear));
  if (filters.winemakerId) conditions.push(eq(wines.winemakerId, filters.winemakerId));

  const rows = await db.query.wines.findMany({
    where: and(...conditions),
    with: {
      winemaker: {
        columns: { deletedAt: true, id: true, name: true },
      },
    },
  });

  return rows.filter((r) => r.winemaker && !r.winemaker.deletedAt) as WineWithWinemaker[];
}

export async function findById(db: Database, id: string): Promise<WineWithWinemaker | undefined> {
  const wine = await db.query.wines.findFirst({
    where: and(eq(wines.id, id), isNull(wines.deletedAt)),
    with: {
      winemaker: {
        columns: { deletedAt: true, id: true, name: true },
      },
    },
  });

  if (wine?.winemaker && !wine.winemaker.deletedAt) {
    return wine as WineWithWinemaker;
  }
  return undefined;
}

export function findWinemakerByUserId(
  db: Database,
  userId: string
): Promise<Winemaker | undefined> {
  return db.query.winemakers.findFirst({
    where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
  });
}

export async function insert(db: Database, winemakerId: string, data: WineData): Promise<Wine> {
  const [wine] = await db
    .insert(wines)
    .values({ winemakerId, ...data })
    .returning();
  if (!wine) throw new Error("Wine insert returned no rows");
  return wine;
}

export async function softDelete(db: Database, id: string): Promise<void> {
  await db.update(wines).set({ deletedAt: new Date() }).where(eq(wines.id, id));
}

export async function updateById(db: Database, id: string, data: WineData): Promise<Wine> {
  const [updated] = await db
    .update(wines)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(wines.id, id))
    .returning();
  if (!updated) throw new Error("Wine not found");
  return updated;
}
=======
export interface IWinesRepository {
  findAll(filters: WineFilters): Promise<WineWithWinemaker[]>;
  findById(id: string): Promise<WineWithWinemaker | undefined>;
  findWinemakerByUserId(userId: string): Promise<Winemaker | undefined>;
  insert(winemakerId: string, data: WineData): Promise<Wine>;
  softDelete(id: string): Promise<void>;
  updateById(id: string, data: WineData): Promise<Wine>;
}

export const winesRepository: IWinesRepository = {
  async findAll(filters: WineFilters): Promise<WineWithWinemaker[]> {
    const conditions = [isNull(wines.deletedAt)];
    if (filters.region) conditions.push(eq(wines.region, filters.region));
    if (filters.type) conditions.push(eq(wines.type, filters.type as WineData["type"]));
    if (filters.color) conditions.push(eq(wines.color, filters.color as WineData["color"]));
    if (filters.vintageYear) conditions.push(eq(wines.vintageYear, filters.vintageYear));
    if (filters.winemakerId) conditions.push(eq(wines.winemakerId, filters.winemakerId));

    const rows = await db.query.wines.findMany({
      where: and(...conditions),
      with: {
        winemaker: {
          columns: { deletedAt: true, id: true, name: true },
        },
      },
    });

    return rows.filter((r) => r.winemaker && !r.winemaker.deletedAt) as WineWithWinemaker[];
  },

  async findById(id: string): Promise<WineWithWinemaker | undefined> {
    const wine = await db.query.wines.findFirst({
      where: and(eq(wines.id, id), isNull(wines.deletedAt)),
      with: {
        winemaker: {
          columns: { deletedAt: true, id: true, name: true },
        },
      },
    });

    if (wine?.winemaker && !wine.winemaker.deletedAt) {
      return wine as WineWithWinemaker;
    }
    return undefined;
  },

  findWinemakerByUserId(userId: string): Promise<Winemaker | undefined> {
    return db.query.winemakers.findFirst({
      where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
    });
  },

  async insert(winemakerId: string, data: WineData): Promise<Wine> {
    const [wine] = await db
      .insert(wines)
      .values({ winemakerId, ...data })
      .returning();
    if (!wine) throw new Error("Wine insert returned no rows");
    return wine;
  },

  async softDelete(id: string): Promise<void> {
    await db.update(wines).set({ deletedAt: new Date() }).where(eq(wines.id, id));
  },

  async updateById(id: string, data: WineData): Promise<Wine> {
    const [updated] = await db
      .update(wines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wines.id, id))
      .returning();
    if (!updated) throw new Error("Wine not found");
    return updated;
  },
};
>>>>>>> origin/main
