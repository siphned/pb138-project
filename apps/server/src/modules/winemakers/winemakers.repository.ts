import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { Address, Wine, Winemaker } from "../../db/schema";
import { events, winemakers, wines } from "../../db/schema";

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

export type WinemakerListItem = Winemaker & { address: Address };

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

export const winemakersRepository = {
  findAll(): Promise<WinemakerListItem[]> {
    return db.query.winemakers.findMany({
      where: isNull(winemakers.deletedAt),
      with: { address: true },
    }) as Promise<WinemakerListItem[]>;
  },

  findById(id: string): Promise<WinemakerWithRelations | undefined> {
    return db.query.winemakers.findFirst({
      where: and(eq(winemakers.id, id), isNull(winemakers.deletedAt)),
      with: {
        address: true,
        wines: { where: isNull(wines.deletedAt) },
        events: { where: isNull(events.deletedAt) },
      },
    }) as Promise<WinemakerWithRelations | undefined>;
  },

  findByIdWithAddress(id: string): Promise<WinemakerListItem | undefined> {
    return db.query.winemakers.findFirst({
      where: and(eq(winemakers.id, id), isNull(winemakers.deletedAt)),
      with: { address: true },
    }) as Promise<WinemakerListItem | undefined>;
  },

  findByUserId(userId: string): Promise<Winemaker | undefined> {
    return db.query.winemakers.findFirst({
      where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
    });
  },

  findWinesByWinemakerId(winemakerId: string): Promise<Wine[]> {
    return db.query.wines.findMany({
      where: and(eq(wines.winemakerId, winemakerId), isNull(wines.deletedAt)),
    });
  },

  findEventsByWinemakerId(winemakerId: string): Promise<EventRow[]> {
    return db.query.events.findMany({
      where: and(eq(events.winemakerId, winemakerId), isNull(events.deletedAt)),
    }) as Promise<EventRow[]>;
  },

  async updateById(id: string, data: UpdateWinemakerData): Promise<Winemaker> {
    const [updated] = await db
      .update(winemakers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(winemakers.id, id))
      .returning();
    if (!updated) throw new Error("Winemaker not found");
    return updated;
  },
};
