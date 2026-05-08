import type { Review } from "@repo/shared/schemas";
import { orderItems, orders, productWines, reviews } from "@repo/shared/schemas";
import { and, asc, avg, count, desc, eq, isNull } from "drizzle-orm";
import type { Database } from "../../db";

export type ReviewWithUser = Review & {
  user: { id: string; fname: string; lname: string };
};

export async function averageRating(
  db: Database,
  entityId: string,
  entityType: "product" | "winemaker" | "wine"
): Promise<number | null> {
  const [row] = await db
    .select({ avg: avg(reviews.rating) })
    .from(reviews)
    .where(
      and(
        eq(reviews.entityId, entityId),
        eq(reviews.entityType, entityType),
        isNull(reviews.deletedAt)
      )
    );
  return row?.avg !== null && row?.avg !== undefined ? Number.parseFloat(row.avg) : null;
}

export async function countReviews(
  db: Database,
  entityId: string,
  entityType: "product" | "winemaker" | "wine"
): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(reviews)
    .where(
      and(
        eq(reviews.entityId, entityId),
        eq(reviews.entityType, entityType),
        isNull(reviews.deletedAt)
      )
    );
  return row?.count ?? 0;
}

export async function findById(db: Database, id: string): Promise<Review | undefined> {
  return db.query.reviews.findFirst({
    where: and(eq(reviews.id, id), isNull(reviews.deletedAt)),
  });
}

export async function findReviews(
  db: Database,
  entityId: string,
  entityType: "product" | "winemaker" | "wine",
  opts: { limit: number; offset: number; sort: "newest" | "highest" | "lowest" }
): Promise<ReviewWithUser[]> {
  let orderBy = [desc(reviews.createdAt)];
  if (opts.sort === "highest") {
    orderBy = [desc(reviews.rating), desc(reviews.createdAt)];
  } else if (opts.sort === "lowest") {
    orderBy = [asc(reviews.rating), desc(reviews.createdAt)];
  }

  return db.query.reviews.findMany({
    limit: opts.limit,
    offset: opts.offset,
    orderBy,
    where: and(
      eq(reviews.entityId, entityId),
      eq(reviews.entityType, entityType),
      isNull(reviews.deletedAt)
    ),
    with: { user: { columns: { fname: true, id: true, lname: true } } },
  }) as Promise<ReviewWithUser[]>;
}

export async function findReviewWithUser(
  db: Database,
  reviewId: string
): Promise<ReviewWithUser | undefined> {
  return db.query.reviews.findFirst({
    where: and(eq(reviews.id, reviewId), isNull(reviews.deletedAt)),
    with: { user: { columns: { fname: true, id: true, lname: true } } },
  }) as Promise<ReviewWithUser | undefined>;
}

export async function findUserReview(
  db: Database,
  userId: string,
  entityId: string,
  entityType: "product" | "winemaker" | "wine"
): Promise<Review | undefined> {
  return db.query.reviews.findFirst({
    where: and(
      eq(reviews.userId, userId),
      eq(reviews.entityId, entityId),
      eq(reviews.entityType, entityType),
      isNull(reviews.deletedAt)
    ),
  });
}

export async function hasPurchasedProduct(
  db: Database,
  userId: string,
  productId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.userId, userId), eq(orderItems.productId, productId)))
    .limit(1);
  return rows.length > 0;
}

export async function hasPurchasedWine(
  db: Database,
  userId: string,
  wineId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(productWines, eq(orderItems.productId, productWines.productId))
    .where(and(eq(orders.userId, userId), eq(productWines.wineId, wineId)))
    .limit(1);
  return rows.length > 0;
}

export async function insertReview(
  db: Database,
  userId: string,
  entityId: string,
  entityType: "product" | "winemaker" | "wine",
  data: { rating: number; body?: string }
): Promise<Review> {
  const [review] = await db
    .insert(reviews)
    .values({
      body: data.body ?? null,
      entityId,
      entityType,
      rating: data.rating,
      userId,
    })
    .returning();
  if (!review) throw new Error("Review insert returned no rows");
  return review;
}

export async function softDelete(db: Database, reviewId: string): Promise<void> {
  await db.update(reviews).set({ deletedAt: new Date() }).where(eq(reviews.id, reviewId));
}
