import type { Review } from "@repo/shared/schemas";
import { orderItems, orders, reviews } from "@repo/shared/schemas";
import { and, asc, avg, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db";

export type ReviewWithUser = Review & {
  user: { id: string; fname: string; lname: string };
};

export interface IReviewsRepository {
  averageRating(entityId: string, entityType: "product" | "winemaker"): Promise<number | null>;
  countReviews(entityId: string, entityType: "product" | "winemaker"): Promise<number>;
  findById(id: string): Promise<Review | undefined>;
  findReviews(
    entityId: string,
    entityType: "product" | "winemaker",
    opts: { limit: number; offset: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewWithUser[]>;
  findReviewWithUser(reviewId: string): Promise<ReviewWithUser | undefined>;
  findUserReview(
    userId: string,
    entityId: string,
    entityType: "product" | "winemaker"
  ): Promise<Review | undefined>;
  hasPurchasedProduct(userId: string, productId: string): Promise<boolean>;
  insertReview(
    userId: string,
    entityId: string,
    entityType: "product" | "winemaker",
    data: { rating: number; body?: string }
  ): Promise<Review>;
  softDelete(reviewId: string): Promise<void>;
}

export const reviewsRepository: IReviewsRepository = {
  async averageRating(
    entityId: string,
    entityType: "product" | "winemaker"
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
  },

  async countReviews(
    entityId: string,
    entityType: "product" | "winemaker"
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
  },

  findById(id: string): Promise<Review | undefined> {
    return db.query.reviews.findFirst({
      where: and(eq(reviews.id, id), isNull(reviews.deletedAt)),
    });
  },

  findReviews(
    entityId: string,
    entityType: "product" | "winemaker",
    opts: { limit: number; offset: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewWithUser[]> {
    let orderBy: (typeof reviews.$inferSelect)[];
    if (opts.sort === "highest") {
      orderBy = [desc(reviews.rating), desc(reviews.createdAt)];
    } else if (opts.sort === "lowest") {
      orderBy = [asc(reviews.rating), desc(reviews.createdAt)];
    } else {
      orderBy = [desc(reviews.createdAt)];
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
  },

  findReviewWithUser(reviewId: string): Promise<ReviewWithUser | undefined> {
    return db.query.reviews.findFirst({
      where: and(eq(reviews.id, reviewId), isNull(reviews.deletedAt)),
      with: { user: { columns: { fname: true, id: true, lname: true } } },
    }) as Promise<ReviewWithUser | undefined>;
  },

  findUserReview(
    userId: string,
    entityId: string,
    entityType: "product" | "winemaker"
  ): Promise<Review | undefined> {
    return db.query.reviews.findFirst({
      where: and(
        eq(reviews.userId, userId),
        eq(reviews.entityId, entityId),
        eq(reviews.entityType, entityType),
        isNull(reviews.deletedAt)
      ),
    });
  },

  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const rows = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.userId, userId), eq(orderItems.productId, productId)))
      .limit(1);
    return rows.length > 0;
  },

  async insertReview(
    userId: string,
    entityId: string,
    entityType: "product" | "winemaker",
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
  },

  async softDelete(reviewId: string): Promise<void> {
    await db.update(reviews).set({ deletedAt: new Date() }).where(eq(reviews.id, reviewId));
  },
};
