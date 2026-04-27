import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { Event, Review, User } from "../../db/schema";
import { events, reviews, userRoles, users } from "../../db/schema";

export type AdminUserRow = User & {
  roles: { id: string; role: string }[];
};

export type AdminEventRow = Event & {
  winemaker: { id: string; name: string } | null;
  address: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  } | null;
};

export type AdminReviewRow = Review & {
  user: { id: string; fname: string; lname: string } | null;
};

export const adminRepository = {
  findEventById(id: string): Promise<Event | undefined> {
    return db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
    });
  },

  findEventWithDetailsById(id: string): Promise<AdminEventRow | undefined> {
    return db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
      with: {
        address: {
          columns: { city: true, country: true, houseNumber: true, postalCode: true, street: true },
        },
        winemaker: { columns: { id: true, name: true } },
      },
    }) as Promise<AdminEventRow | undefined>;
  },

  findReviewById(id: string) {
    return db.query.reviews.findFirst({
      where: and(eq(reviews.id, id), isNull(reviews.deletedAt)),
    });
  },

  findUserById(id: string): Promise<AdminUserRow | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.id, id), isNull(users.deletedAt)),
      with: {
        roles: {
          columns: { id: true, role: true },
          where: isNull(userRoles.deletedAt),
        },
      },
    }) as Promise<AdminUserRow | undefined>;
  },

  async listAllReviews(pagination: {
    limit: number;
    offset: number;
  }): Promise<{ data: AdminReviewRow[]; total: number }> {
    const where = isNull(reviews.deletedAt);

    const [data, countResult] = await Promise.all([
      db.query.reviews.findMany({
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        where,
        with: {
          user: { columns: { fname: true, id: true, lname: true } },
        },
      }),
      db.select({ value: count() }).from(reviews).where(where),
    ]);

    return { data: data as AdminReviewRow[], total: Number(countResult[0]?.value ?? 0) };
  },

  async listEvents(
    filters: { status: "pending" | "approved" | "rejected" },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AdminEventRow[]; total: number }> {
    const where = and(eq(events.status, filters.status), isNull(events.deletedAt));

    const [data, countResult] = await Promise.all([
      db.query.events.findMany({
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (e, { asc }) => [asc(e.startTime)],
        where,
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
          winemaker: { columns: { id: true, name: true } },
        },
      }),
      db.select({ value: count() }).from(events).where(where),
    ]);

    return { data: data as AdminEventRow[], total: Number(countResult[0]?.value ?? 0) };
  },
  async listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: string },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    const conditions = [
      isNull(users.deletedAt),
      filters.status !== undefined ? eq(users.status, filters.status) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const where = and(...conditions);

    const [data, countResult] = await Promise.all([
      db.query.users.findMany({
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (u, { desc }) => [desc(u.createdAt)],
        where,
        with: {
          roles: {
            columns: { id: true, role: true },
            where: isNull(userRoles.deletedAt),
          },
        },
      }),
      db.select({ value: count() }).from(users).where(where),
    ]);

    return { data: data as AdminUserRow[], total: Number(countResult[0]?.value ?? 0) };
  },

  async setEventStatus(id: string, newStatus: "approved" | "rejected"): Promise<void> {
    await db
      .update(events)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(events.id, id));
  },

  async setUserStatus(
    id: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
    const [updated] = await db
      .update(users)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated as AdminUserRow;
  },

  async softDeleteReview(id: string): Promise<void> {
    await db.update(reviews).set({ deletedAt: new Date() }).where(eq(reviews.id, id));
  },
};
