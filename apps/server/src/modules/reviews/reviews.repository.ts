import { NotFoundError } from "@repo/shared";
import type { Review } from "@repo/shared/schemas";
import {
  orderItems,
  orders,
  products,
  productWines,
  reviews,
  users,
  wines,
} from "@repo/shared/schemas";
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

export async function averageShopRating(db: Database, shopId: string): Promise<number | null> {
  const [row] = await db
    .select({ avg: avg(reviews.rating) })
    .from(reviews)
    .innerJoin(products, eq(reviews.entityId, products.id))
    .where(
      and(
        eq(reviews.entityType, "product"),
        eq(products.shopId, shopId),
        isNull(reviews.deletedAt),
        isNull(products.deletedAt)
      )
    );
  return row?.avg !== null && row?.avg !== undefined ? Number.parseFloat(row.avg) : null;
}

export async function countShopReviews(db: Database, shopId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(reviews)
    .innerJoin(products, eq(reviews.entityId, products.id))
    .where(
      and(
        eq(reviews.entityType, "product"),
        eq(products.shopId, shopId),
        isNull(reviews.deletedAt),
        isNull(products.deletedAt)
      )
    );
  return row?.count ?? 0;
}

export async function findShopReviews(
  db: Database,
  shopId: string,
  opts: { limit: number; offset: number; sort: "newest" | "highest" | "lowest" }
): Promise<ReviewWithUser[]> {
  let orderBy = [desc(reviews.createdAt)];
  if (opts.sort === "highest") {
    orderBy = [desc(reviews.rating), desc(reviews.createdAt)];
  } else if (opts.sort === "lowest") {
    orderBy = [asc(reviews.rating), desc(reviews.createdAt)];
  }

  const rows = await db
    .select({
      review: reviews,
      user: { fname: users.fname, id: users.id, lname: users.lname },
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.entityId, products.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(
      and(
        eq(reviews.entityType, "product"),
        eq(products.shopId, shopId),
        isNull(reviews.deletedAt),
        isNull(products.deletedAt)
      )
    )
    .orderBy(...orderBy)
    .limit(opts.limit)
    .offset(opts.offset);

  return rows.map((row) => ({ ...row.review, user: row.user }));
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
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "delivered"),
        eq(orderItems.productId, productId)
      )
    )
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
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "delivered"),
        eq(productWines.wineId, wineId)
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function hasPurchasedFromWinemaker(
  db: Database,
  userId: string,
  winemakerId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(productWines, eq(orderItems.productId, productWines.productId))
    .innerJoin(wines, eq(productWines.wineId, wines.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "delivered"),
        eq(wines.winemakerId, winemakerId)
      )
    )
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
  if (!review) throw new NotFoundError("Review insert returned no rows");
  return review;
}

export async function softDelete(db: Database, reviewId: string): Promise<void> {
  await db.update(reviews).set({ deletedAt: new Date() }).where(eq(reviews.id, reviewId));
}

export async function flagReview(db: Database, reviewId: string): Promise<void> {
  await db.update(reviews).set({ flaggedAt: new Date() }).where(eq(reviews.id, reviewId));
}

export async function unflagReview(db: Database, reviewId: string): Promise<void> {
  await db.update(reviews).set({ flaggedAt: null }).where(eq(reviews.id, reviewId));
}

export const reviewsRepository = {
  averageRating,
  averageShopRating,
  countReviews,
  countShopReviews,
  findById,
  findReviews,
  findReviewWithUser,
  findShopReviews,
  findUserReview,
  hasPurchasedFromWinemaker,
  hasPurchasedProduct,
  hasPurchasedWine,
  insertReview,
  softDelete,
};
