import type {
  Event,
  EventComment,
  EventInvitationModel,
  EventRegistration,
} from "@repo/shared/schemas";
import {
  addresses,
  eventComments,
  eventInvitations,
  eventRegistrations,
  events,
  winemakers,
} from "@repo/shared/schemas";
import { and, count, eq, gte, ilike, inArray, isNull, lte } from "drizzle-orm";
import type { Database } from "../../db";
import { primaryImageUrlSql } from "../images/images.sql";

export type EventWithDetails = Event & {
  winemaker: { id: string; name: string } | null;
  address: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  } | null;
  imageUrl?: string | null;
};

export type CommentWithUser = EventComment & {
  user: { id: string; fname: string; lname: string };
};

type RepoFilters = {
  status: "pending" | "approved" | "rejected";
  from?: Date;
  q?: string;
  to?: Date;
  winemakerIds?: string[];
};

export async function countActiveRegistrations(db: Database, eventId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, eventId), isNull(eventRegistrations.deletedAt)));
  return Number(result?.value ?? 0);
}

export async function countComments(db: Database, eventId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(eventComments)
    .where(and(eq(eventComments.eventId, eventId), isNull(eventComments.deletedAt)));
  return Number(result?.value ?? 0);
}

export async function countMany(db: Database, filters: RepoFilters): Promise<number> {
  const qCond = filters.q ? ilike(events.name, `%${filters.q}%`) : undefined;
  const conditions = [
    isNull(events.deletedAt),
    eq(events.status, filters.status),
    filters.from ? gte(events.startTime, filters.from) : undefined,
    filters.to ? lte(events.startTime, filters.to) : undefined,
    filters.winemakerIds ? inArray(events.winemakerId, filters.winemakerIds) : undefined,
    qCond,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const [result] = await db
    .select({ value: count() })
    .from(events)
    .where(and(...conditions));
  return Number(result?.value ?? 0);
}

export async function createComment(
  db: Database,
  eventId: string,
  userId: string,
  body: string
): Promise<EventComment> {
  const [comment] = await db.insert(eventComments).values({ body, eventId, userId }).returning();
  if (!comment) throw new Error("Comment insert returned no rows");
  return comment;
}

export async function createEvent(
  db: Database,
  winemakerId: string,
  addressId: string,
  data: {
    name: string;
    description?: string | null;
    capacity: number;
    startTime: Date;
    endTime: Date;
    inviteType: string;
    visibility: "public" | "private";
  }
): Promise<Event> {
  const [event] = await db
    .insert(events)
    .values({
      addressId,
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
}

export async function insertAddress(
  db: Database,
  data: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  }
): Promise<{ id: string }> {
  const [address] = await db.insert(addresses).values(data).returning();
  if (!address) throw new Error("Address insert returned no rows");
  return address;
}

export async function createRegistration(
  db: Database,
  eventId: string,
  userId: string
): Promise<EventRegistration> {
  const [reg] = await db.insert(eventRegistrations).values({ eventId, userId }).returning();
  if (!reg) throw new Error("Registration insert returned no rows");
  return reg;
}

export async function findRegistration(
  db: Database,
  eventId: string,
  userId: string
): Promise<EventRegistration | undefined> {
  return db.query.eventRegistrations.findFirst({
    where: and(
      eq(eventRegistrations.eventId, eventId),
      eq(eventRegistrations.userId, userId),
      isNull(eventRegistrations.deletedAt)
    ),
  });
}

export async function findRegisteredEventIds(
  db: Database,
  userId: string,
  eventIds: string[]
): Promise<Set<string>> {
  if (eventIds.length === 0) return new Set();
  const rows = await db
    .select({ eventId: eventRegistrations.eventId })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.userId, userId),
        inArray(eventRegistrations.eventId, eventIds),
        isNull(eventRegistrations.deletedAt)
      )
    );
  return new Set(rows.map((r) => r.eventId));
}

export async function findById(db: Database, id: string): Promise<EventWithDetails | undefined> {
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
}

export async function findComments(
  db: Database,
  eventId: string,
  pagination: { limit: number; offset: number }
): Promise<CommentWithUser[]> {
  return db.query.eventComments.findMany({
    limit: pagination.limit,
    offset: pagination.offset,
    orderBy: (c, { desc }) => [desc(c.createdAt)],
    where: and(eq(eventComments.eventId, eventId), isNull(eventComments.deletedAt)),
    with: { user: { columns: { fname: true, id: true, lname: true } } },
  }) as Promise<CommentWithUser[]>;
}

export async function findMany(
  db: Database,
  filters: RepoFilters,
  pagination: { limit: number; offset: number }
): Promise<EventWithDetails[]> {
  const qCond = filters.q ? ilike(events.name, `%${filters.q}%`) : undefined;
  const conditions = [
    isNull(events.deletedAt),
    eq(events.status, filters.status),
    filters.from ? gte(events.startTime, filters.from) : undefined,
    filters.to ? lte(events.startTime, filters.to) : undefined,
    filters.winemakerIds ? inArray(events.winemakerId, filters.winemakerIds) : undefined,
    qCond,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const rows = await db.query.events.findMany({
    extras: { imageUrl: primaryImageUrlSql("event", events.id).as("image_url") },
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
}

export async function findWinemakerByUserId(db: Database, userId: string) {
  return db.query.winemakers.findFirst({
    columns: { id: true, name: true },
    where: and(eq(winemakers.userId, userId), isNull(winemakers.deletedAt)),
  });
}

export async function resolveWinemakerIdsByName(db: Database, name: string): Promise<string[]> {
  const rows = await db.query.winemakers.findMany({
    columns: { id: true },
    where: and(ilike(winemakers.name, `%${name}%`), isNull(winemakers.deletedAt)),
  });
  return rows.map((r) => r.id);
}

export async function findInvitationsByEventId(
  db: Database,
  eventId: string
): Promise<EventInvitationModel[]> {
  return db.query.eventInvitations.findMany({
    where: and(eq(eventInvitations.eventId, eventId), isNull(eventInvitations.deletedAt)),
  });
}

export async function softDelete(db: Database, id: string): Promise<void> {
  await db.update(events).set({ deletedAt: new Date() }).where(eq(events.id, id));
}

export async function softDeleteRegistration(db: Database, id: string): Promise<void> {
  await db
    .update(eventRegistrations)
    .set({ deletedAt: new Date() })
    .where(eq(eventRegistrations.id, id));
}

export async function update(
  db: Database,
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
}
