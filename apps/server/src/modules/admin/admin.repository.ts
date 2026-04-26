import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { Event } from "../../db/schema";
import { events, productReviews, users, winemakerReviews } from "../../db/schema";

export type AdminUserRow = {
  id: string;
  fname: string;
  lname: string;
  email: string;
  status: "active" | "suspended" | "banned";
  createdAt: Date;
  deletedAt: Date | null;
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

export type AdminReviewRow = {
  id: string;
  type: "product" | "winemaker";
  userId: string;
  targetId: string;
  rating: number;
  body: string | null;
  createdAt: Date;
};

export const adminRepository = {
  async listUsers(
    filters: { status?: "active" | "suspended" | "banned" },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    const conditions = [
      isNull(users.deletedAt),
      filters.status !== undefined ? eq(users.status, filters.status) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const where = and(...conditions);

    const [data, countResult] = await Promise.all([
      db.query.users.findMany({
        where,
        columns: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          status: true,
          createdAt: true,
          deletedAt: true,
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (u, { desc }) => [desc(u.createdAt)],
      }),
      db.select({ value: count() }).from(users).where(where),
    ]);

    return { data: data as AdminUserRow[], total: Number(countResult[0]?.value ?? 0) };
  },

  findUserById(id: string) {
    return db.query.users.findFirst({ where: and(eq(users.id, id), isNull(users.deletedAt)) });
  },

  async setUserStatus(
    id: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
    const [updated] = await db
      .update(users)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning({
        id: users.id,
        fname: users.fname,
        lname: users.lname,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
      });
    if (!updated) throw new Error("User not found");
    return updated;
  },

  async listEvents(
    filters: { status: "pending" | "approved" | "rejected" },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AdminEventRow[]; total: number }> {
    const where = and(eq(events.status, filters.status), isNull(events.deletedAt));

    const [data, countResult] = await Promise.all([
      db.query.events.findMany({
        where,
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
      }),
      db.select({ value: count() }).from(events).where(where),
    ]);

    return { data: data as AdminEventRow[], total: Number(countResult[0]?.value ?? 0) };
  },

  findEventById(id: string): Promise<Event | undefined> {
    return db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
    });
  },

  findEventWithDetailsById(id: string): Promise<AdminEventRow | undefined> {
    return db.query.events.findFirst({
      where: and(eq(events.id, id), isNull(events.deletedAt)),
      with: {
        winemaker: { columns: { id: true, name: true } },
        address: {
          columns: { country: true, city: true, postalCode: true, street: true, houseNumber: true },
        },
      },
    }) as Promise<AdminEventRow | undefined>;
  },

  async setEventStatus(id: string, newStatus: "approved" | "rejected"): Promise<void> {
    await db
      .update(events)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(events.id, id));
  },

  async listAllReviews(pagination: {
    limit: number;
    offset: number;
  }): Promise<{ data: AdminReviewRow[]; total: number }> {
    const [productRows, winemakerRows, productCount, winemakerCount] = await Promise.all([
      db.query.productReviews.findMany({
        where: isNull(productReviews.deletedAt),
        columns: {
          id: true,
          userId: true,
          productId: true,
          rating: true,
          body: true,
          createdAt: true,
        },
      }),
      db.query.winemakerReviews.findMany({
        where: isNull(winemakerReviews.deletedAt),
        columns: {
          id: true,
          userId: true,
          winemakerId: true,
          rating: true,
          body: true,
          createdAt: true,
        },
      }),
      db.select({ value: count() }).from(productReviews).where(isNull(productReviews.deletedAt)),
      db
        .select({ value: count() })
        .from(winemakerReviews)
        .where(isNull(winemakerReviews.deletedAt)),
    ]);

    const combined: AdminReviewRow[] = [
      ...productRows.map((r) => ({
        id: r.id,
        type: "product" as const,
        userId: r.userId,
        targetId: r.productId,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
      })),
      ...winemakerRows.map((r) => ({
        id: r.id,
        type: "winemaker" as const,
        userId: r.userId,
        targetId: r.winemakerId,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = Number(productCount[0]?.value ?? 0) + Number(winemakerCount[0]?.value ?? 0);

    return {
      data: combined.slice(pagination.offset, pagination.offset + pagination.limit),
      total,
    };
  },

  findProductReviewById(id: string) {
    return db.query.productReviews.findFirst({
      where: and(eq(productReviews.id, id), isNull(productReviews.deletedAt)),
    });
  },

  findWinemakerReviewById(id: string) {
    return db.query.winemakerReviews.findFirst({
      where: and(eq(winemakerReviews.id, id), isNull(winemakerReviews.deletedAt)),
    });
  },

  async softDeleteProductReview(id: string): Promise<void> {
    await db.update(productReviews).set({ deletedAt: new Date() }).where(eq(productReviews.id, id));
  },

  async softDeleteWinemakerReview(id: string): Promise<void> {
    await db
      .update(winemakerReviews)
      .set({ deletedAt: new Date() })
      .where(eq(winemakerReviews.id, id));
  },
};
