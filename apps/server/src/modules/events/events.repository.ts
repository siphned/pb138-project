import type { Event, EventComment, EventRegistration } from "@repo/shared/schemas";
import {
  addresses,
  eventComments,
  eventRegistrations,
  events,
  winemakers,
} from "@repo/shared/schemas";
import { and, count, eq, gte, ilike, inArray, isNull, lte } from "drizzle-orm";
import { db } from "../../db";

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
  async countActiveRegistrations(eventId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), isNull(eventRegistrations.deletedAt)));
    return Number(result?.value ?? 0);
  },

  async countComments(eventId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(eventComments)
      .where(and(eq(eventComments.eventId, eventId), isNull(eventComments.deletedAt)));
    return Number(result?.value ?? 0);
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

  async createComment(eventId: string, userId: string, body: string): Promise<EventComment> {
    const [comment] = await db.insert(eventComments).values({ body, eventId, userId }).returning();
    if (!comment) throw new Error("Comment insert returned no rows");
    return comment;
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
          addressId: address.id,
          capacity: data.capacity,
          description: data.description ?? null,
          endTime: data.endTime,
          inviteType: data.inviteType,
          name: data.name,
          startTime: data.startTime,
          status: "pending",
          visibility: data.visibility,
          winemakerId,
        })
        .returning();
      if (!event) throw new Error("Event insert returned no rows");
      return event;
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

  findActiveRegistration(eventId: string, userId: string): Promise<EventRegistration | undefined> {
    return db.query.eventRegistrations.findFirst({
      where: and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
        isNull(eventRegistrations.deletedAt)
      ),
    });
  },

  async findById(id: string): Promise<EventWithDetails | undefined> {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
      with: {
        address: {
          columns: {
            city: true,
            country: true,
            houseNumber: true,
            postalCode: true,
            street: true,
          },
        },
        winemaker: {
          columns: { deletedAt: true, id: true, name: true },
        },
      },
    });

    if (event?.winemaker && !event.winemaker.deletedAt) {
      return event as EventWithDetails;
    }
    return undefined;
  },

  findComments(
    eventId: string,
    pagination: { limit: number; offset: number }
  ): Promise<CommentWithUser[]> {
    return db.query.eventComments.findMany({
      limit: pagination.limit,
      offset: pagination.offset,
      orderBy: (c, { asc }) => [asc(c.createdAt)],
      where: and(eq(eventComments.eventId, eventId), isNull(eventComments.deletedAt)),
      with: { user: { columns: { fname: true, id: true, lname: true } } },
    }) as Promise<CommentWithUser[]>;
  },

  async findMany(
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

    const rows = await db.query.events.findMany({
      limit: pagination.limit,
      offset: pagination.offset,
      orderBy: (e, { asc }) => [asc(e.startTime)],
      where: and(...conditions),
      with: {
        address: {
          columns: {
            city: true,
            country: true,
            houseNumber: true,
            postalCode: true,
            street: true,
          },
        },
        winemaker: {
          columns: { deletedAt: true, id: true, name: true },
        },
      },
    });

    return rows.filter((r) => r.winemaker && !r.winemaker.deletedAt) as EventWithDetails[];
  },
  findWinemakerByUserId(userId: string) {
    return db.query.winemakers.findFirst({
      columns: { id: true, name: true },
      where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
    });
  },

  resolveWinemakerIdsByName(name: string): Promise<string[]> {
    return db.query.winemakers
      .findMany({
        columns: { id: true },
        where: and(ilike(winemakers.name, `%${name}%`), isNull(winemakers.deletedAt)),
      })
      .then((rows) => rows.map((r) => r.id));
  },

  async softDelete(id: string): Promise<void> {
    await db.update(events).set({ deletedAt: new Date() }).where(eq(events.id, id));
  },

  async softDeleteRegistration(id: string): Promise<void> {
    await db
      .update(eventRegistrations)
      .set({ deletedAt: new Date() })
      .where(eq(eventRegistrations.id, id));
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
};
