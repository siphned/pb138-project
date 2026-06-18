import type { Review, User } from "@repo/shared/schemas";
import { reviews, userRoles, users } from "@repo/shared/schemas";
import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import type { Database } from "../../db";

export type AdminUserRow = User & {
  roles: { id: string; role: string }[];
};

export type AdminReviewRow = Review & {
  user: { id: string; fname: string; lname: string } | null;
};

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
  const where = and(isNull(reviews.deletedAt), isNotNull(reviews.flaggedAt));

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

export async function unflagReview(db: Database, id: string): Promise<void> {
  await db.update(reviews).set({ flaggedAt: null }).where(eq(reviews.id, id));
}
