import { and, count, eq, gte, ilike, inArray, isNull, lte } from "drizzle-orm";
import { db } from "../../db";
import type { Event, EventComment, EventRegistration } from "../../db/schema";
import { addresses, eventComments, eventRegistrations, events, winemakers } from "../../db/schema";

export type EventWithDetails = Event & {
  winemaker: { id: string; name: string } | null;
  address: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  } | null;
};

export type CommentWithUser = EventComment & {
  user: { id: string; fname: string; lname: string };
};

type RepoFilters = {
  status: "pending" | "approved" | "rejected";
  from?: Date;
  to?: Date;
  winemakerIds?: string[];
};

export const eventsRepository = {
  findWinemakerByUserId(userId: string) {
    return db.query.winemakers.findFirst({
      where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
      columns: { id: true, name: true },
    });
  },

  resolveWinemakerIdsByName(name: string): Promise<string[]> {
    return db.query.winemakers
      .findMany({
        where: and(ilike(winemakers.name, `%${name}%`), isNull(winemakers.deletedAt)),
        columns: { id: true },
      })
      .then((rows) => rows.map((r) => r.id));
  },

  findById(id: string): Promise<EventWithDetails | undefined> {
    return db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
      with: {
        winemaker: { columns: { id: true, name: true } },
        address: {
          columns: {
            country: true,
            city: true,
            postalCode: true,
            street: true,
            houseNumber: true,
          },
        },
      },
    }) as Promise<EventWithDetails | undefined>;
  },

  findMany(
    filters: RepoFilters,
    pagination: { limit: number; offset: number }
  ): Promise<EventWithDetails[]> {
    const conditions = [
      isNull(events.deletedAt),
      eq(events.status, filters.status),
      filters.from ? gte(events.startTime, filters.from) : undefined,
      filters.to ? lte(events.startTime, filters.to) : undefined,
      filters.winemakerIds ? inArray(events.winemakerId, filters.winemakerIds) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    return db.query.events.findMany({
      where: and(...conditions),
      with: {
        winemaker: { columns: { id: true, name: true } },
        address: {
          columns: {
            country: true,
            city: true,
            postalCode: true,
            street: true,
            houseNumber: true,
          },
        },
      },
      limit: pagination.limit,
      offset: pagination.offset,
      orderBy: (e, { asc }) => [asc(e.startTime)],
    }) as Promise<EventWithDetails[]>;
  },

  async countMany(filters: RepoFilters): Promise<number> {
    const conditions = [
      isNull(events.deletedAt),
      eq(events.status, filters.status),
      filters.from ? gte(events.startTime, filters.from) : undefined,
      filters.to ? lte(events.startTime, filters.to) : undefined,
      filters.winemakerIds ? inArray(events.winemakerId, filters.winemakerIds) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const [result] = await db
      .select({ value: count() })
      .from(events)
      .where(and(...conditions));
    return Number(result?.value ?? 0);
  },

  async createEventWithAddress(
    winemakerId: string,
    data: {
      name: string;
      description?: string;
      capacity: number;
      startTime: Date;
      endTime: Date;
      inviteType: string;
      visibility: "public" | "private";
    },
    addressData: {
      country: string;
      city: string;
      postalCode: string;
      street: string;
      houseNumber: string;
    }
  ): Promise<Event> {
    return db.transaction(async (tx) => {
      const [address] = await tx.insert(addresses).values(addressData).returning();
      if (!address) throw new Error("Address insert returned no rows");

      const [event] = await tx
        .insert(events)
        .values({
          winemakerId,
          addressId: address.id,
          name: data.name,
          description: data.description ?? null,
          capacity: data.capacity,
          startTime: data.startTime,
          endTime: data.endTime,
          inviteType: data.inviteType,
          visibility: data.visibility,
          status: "pending",
        })
        .returning();
      if (!event) throw new Error("Event insert returned no rows");
      return event;
    });
  },

  async update(
    id: string,
    fields: {
      name?: string;
      description?: string | null;
      capacity?: number;
      startTime?: Date;
      endTime?: Date;
    }
  ): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    if (!updated) throw new Error("Event not found");
    return updated;
  },

  async softDelete(id: string): Promise<void> {
    await db.update(events).set({ deletedAt: new Date() }).where(eq(events.id, id));
  },

  async countActiveRegistrations(eventId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), isNull(eventRegistrations.deletedAt)));
    return Number(result?.value ?? 0);
  },

  findActiveRegistration(eventId: string, userId: string): Promise<EventRegistration | undefined> {
    return db.query.eventRegistrations.findFirst({
      where: and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
        isNull(eventRegistrations.deletedAt)
      ),
    });
  },

  async createRegistration(
    eventId: string,
    userId: string,
    capacity: number
  ): Promise<EventRegistration> {
    return db.transaction(async (tx) => {
      const existing = await tx.query.eventRegistrations.findFirst({
        where: and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId),
          isNull(eventRegistrations.deletedAt)
        ),
      });
      if (existing) throw new Error("ALREADY_REGISTERED");

      const [countResult] = await tx
        .select({ value: count() })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, eventId), isNull(eventRegistrations.deletedAt)));
      if (Number(countResult?.value ?? 0) >= capacity) throw new Error("CAPACITY_FULL");

      const [reg] = await tx.insert(eventRegistrations).values({ eventId, userId }).returning();
      if (!reg) throw new Error("Registration insert returned no rows");
      return reg;
    });
  },

  async softDeleteRegistration(id: string): Promise<void> {
    await db
      .update(eventRegistrations)
      .set({ deletedAt: new Date() })
      .where(eq(eventRegistrations.id, id));
  },

  findComments(
    eventId: string,
    pagination: { limit: number; offset: number }
  ): Promise<CommentWithUser[]> {
    return db.query.eventComments.findMany({
      where: and(eq(eventComments.eventId, eventId), isNull(eventComments.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
      limit: pagination.limit,
      offset: pagination.offset,
      orderBy: (c, { asc }) => [asc(c.createdAt)],
    }) as Promise<CommentWithUser[]>;
  },

  async countComments(eventId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(eventComments)
      .where(and(eq(eventComments.eventId, eventId), isNull(eventComments.deletedAt)));
    return Number(result?.value ?? 0);
  },

  async createComment(eventId: string, userId: string, body: string): Promise<EventComment> {
    const [comment] = await db.insert(eventComments).values({ eventId, userId, body }).returning();
    if (!comment) throw new Error("Comment insert returned no rows");
    return comment;
  },
};
