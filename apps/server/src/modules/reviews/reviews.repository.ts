import { and, avg, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import { orderItems, orders, productReviews, winemakerReviews } from "../../db/schema";
import type { ProductReview, WinemakerReview } from "../../db/schema";

export type ProductReviewWithUser = ProductReview & {
  user: { id: string; fname: string; lname: string };
};

export type WinemakerReviewWithUser = WinemakerReview & {
  user: { id: string; fname: string; lname: string };
};

export const reviewsRepository = {
  findProductReviews(productId: string): Promise<ProductReviewWithUser[]> {
    return db.query.productReviews.findMany({
      where: and(eq(productReviews.productId, productId), isNull(productReviews.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
    }) as Promise<ProductReviewWithUser[]>;
  },

  findWinemakerReviews(winemakerId: string): Promise<WinemakerReviewWithUser[]> {
    return db.query.winemakerReviews.findMany({
      where: and(eq(winemakerReviews.winemakerId, winemakerId), isNull(winemakerReviews.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
    }) as Promise<WinemakerReviewWithUser[]>;
  },

  async averageProductRating(productId: string): Promise<number | null> {
    const [row] = await db
      .select({ avg: avg(productReviews.rating) })
      .from(productReviews)
      .where(and(eq(productReviews.productId, productId), isNull(productReviews.deletedAt)));
    return row?.avg !== null && row?.avg !== undefined ? Number.parseFloat(row.avg) : null;
  },

  async averageWinemakerRating(winemakerId: string): Promise<number | null> {
    const [row] = await db
      .select({ avg: avg(winemakerReviews.rating) })
      .from(winemakerReviews)
      .where(
        and(eq(winemakerReviews.winemakerId, winemakerId), isNull(winemakerReviews.deletedAt))
      );
    return row?.avg !== null && row?.avg !== undefined ? Number.parseFloat(row.avg) : null;
  },

  findProductReview(userId: string, productId: string): Promise<ProductReview | undefined> {
    return db.query.productReviews.findFirst({
      where: and(
        eq(productReviews.userId, userId),
        eq(productReviews.productId, productId),
        isNull(productReviews.deletedAt)
      ),
    });
  },

  findWinemakerReview(userId: string, winemakerId: string): Promise<WinemakerReview | undefined> {
    return db.query.winemakerReviews.findFirst({
      where: and(
        eq(winemakerReviews.userId, userId),
        eq(winemakerReviews.winemakerId, winemakerId),
        isNull(winemakerReviews.deletedAt)
      ),
    });
  },

  findProductReviewById(reviewId: string, productId: string): Promise<ProductReview | undefined> {
    return db.query.productReviews.findFirst({
      where: and(
        eq(productReviews.id, reviewId),
        eq(productReviews.productId, productId),
        isNull(productReviews.deletedAt)
      ),
    });
  },

  findWinemakerReviewById(
    reviewId: string,
    winemakerId: string
  ): Promise<WinemakerReview | undefined> {
    return db.query.winemakerReviews.findFirst({
      where: and(
        eq(winemakerReviews.id, reviewId),
        eq(winemakerReviews.winemakerId, winemakerId),
        isNull(winemakerReviews.deletedAt)
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

  async insertProductReview(
    userId: string,
    productId: string,
    data: { rating: number; body?: string }
  ): Promise<ProductReview> {
    const [review] = await db
      .insert(productReviews)
      .values({ userId, productId, rating: data.rating, body: data.body ?? null })
      .returning();
    if (!review) throw new Error("Product review insert returned no rows");
    return review;
  },

  async insertWinemakerReview(
    userId: string,
    winemakerId: string,
    data: { rating: number; body?: string }
  ): Promise<WinemakerReview> {
    const [review] = await db
      .insert(winemakerReviews)
      .values({ userId, winemakerId, rating: data.rating, body: data.body ?? null })
      .returning();
    if (!review) throw new Error("Winemaker review insert returned no rows");
    return review;
  },

  findProductReviewWithUser(reviewId: string): Promise<ProductReviewWithUser | undefined> {
    return db.query.productReviews.findFirst({
      where: and(eq(productReviews.id, reviewId), isNull(productReviews.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
    }) as Promise<ProductReviewWithUser | undefined>;
  },

  findWinemakerReviewWithUser(reviewId: string): Promise<WinemakerReviewWithUser | undefined> {
    return db.query.winemakerReviews.findFirst({
      where: and(eq(winemakerReviews.id, reviewId), isNull(winemakerReviews.deletedAt)),
      with: { user: { columns: { id: true, fname: true, lname: true } } },
    }) as Promise<WinemakerReviewWithUser | undefined>;
  },

  async softDeleteProductReview(reviewId: string): Promise<void> {
    await db
      .update(productReviews)
      .set({ deletedAt: new Date() })
      .where(eq(productReviews.id, reviewId));
  },

  async softDeleteWinemakerReview(reviewId: string): Promise<void> {
    await db
      .update(winemakerReviews)
      .set({ deletedAt: new Date() })
      .where(eq(winemakerReviews.id, reviewId));
  },
};
