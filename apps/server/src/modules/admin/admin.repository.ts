import type { Event, Review, User } from "@repo/shared/schemas";
import { events, reviews, userRoles, users } from "@repo/shared/schemas";
import { and, count, eq, isNull } from "drizzle-orm";
<<<<<<< HEAD
import type { Database } from "../../db";
=======
import { db } from "../../db";
>>>>>>> origin/main

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

<<<<<<< HEAD
export async function findEventById(db: Database, id: string): Promise<Event | undefined> {
  return db.query.events.findFirst({
    where: and(eq(events.id, id), isNull(events.deletedAt)),
  });
}

export async function findEventWithDetailsById(
  db: Database,
  id: string
): Promise<AdminEventRow | undefined> {
  return db.query.events.findFirst({
    where: and(eq(events.id, id), isNull(events.deletedAt)),
    with: {
      address: {
        columns: { city: true, country: true, houseNumber: true, postalCode: true, street: true },
      },
      winemaker: { columns: { id: true, name: true } },
    },
  }) as Promise<AdminEventRow | undefined>;
}

export async function findReviewById(db: Database, id: string) {
  return db.query.reviews.findFirst({
    where: and(eq(reviews.id, id), isNull(reviews.deletedAt)),
  });
}

export async function findUserById(db: Database, id: string): Promise<AdminUserRow | undefined> {
  return db.query.users.findFirst({
    where: and(eq(users.id, id), isNull(users.deletedAt)),
    with: {
      roles: {
        columns: { id: true, role: true },
        where: isNull(userRoles.deletedAt),
      },
    },
  }) as Promise<AdminUserRow | undefined>;
}

export async function listAllReviews(
  db: Database,
  pagination: {
    limit: number;
    offset: number;
  }
): Promise<{ data: AdminReviewRow[]; total: number }> {
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
}

export async function listEvents(
  db: Database,
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
}

export async function listUsers(
  db: Database,
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
=======
export interface IAdminRepository {
  findEventById(id: string): Promise<Event | undefined>;
  findEventWithDetailsById(id: string): Promise<AdminEventRow | undefined>;
  findReviewById(id: string): Promise<Review | undefined>;
  findUserById(id: string): Promise<AdminUserRow | undefined>;
  listAllReviews(pagination: {
    limit: number;
    offset: number;
  }): Promise<{ data: AdminReviewRow[]; total: number }>;
  listEvents(
    filters: { status: "pending" | "approved" | "rejected" },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AdminEventRow[]; total: number }>;
  listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: string },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AdminUserRow[]; total: number }>;
  setEventStatus(id: string, newStatus: "approved" | "rejected"): Promise<void>;
  setUserStatus(id: string, newStatus: "active" | "suspended" | "banned"): Promise<AdminUserRow>;
  softDeleteReview(id: string): Promise<void>;
}

export const adminRepository: IAdminRepository = {
  async findEventById(id: string): Promise<Event | undefined> {
    return db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
    });
  },

  async findEventWithDetailsById(id: string): Promise<AdminEventRow | undefined> {
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

  async findReviewById(id: string) {
    return db.query.reviews.findFirst({
      where: and(eq(reviews.id, id), isNull(reviews.deletedAt)),
    });
  },

  async findUserById(id: string): Promise<AdminUserRow | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.id, id), isNull(users.deletedAt)),
>>>>>>> origin/main
      with: {
        roles: {
          columns: { id: true, role: true },
          where: isNull(userRoles.deletedAt),
        },
      },
<<<<<<< HEAD
    }),
    db.select({ value: count() }).from(users).where(where),
  ]);

  return { data: data as AdminUserRow[], total: Number(countResult[0]?.value ?? 0) };
}

export async function setEventStatus(
  db: Database,
  id: string,
  newStatus: "approved" | "rejected"
): Promise<void> {
  await db
    .update(events)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(events.id, id));
}

export async function setUserStatus(
  db: Database,
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
}

export async function softDeleteReview(db: Database, id: string): Promise<void> {
  await db.update(reviews).set({ deletedAt: new Date() }).where(eq(reviews.id, id));
}
=======
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
>>>>>>> origin/main
