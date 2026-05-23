// apps/server/src/modules/stats/stats.repository.ts
import {
  eventRegistrations,
  events,
  orderItems,
  orders,
  products,
  reviews,
  roleRequests,
  shops,
  supplyAgreements,
  userRoles,
  winemakers,
  wines,
} from "@repo/shared/schemas";
import { and, avg, count, eq, inArray, isNotNull, isNull, ne, sql, sum } from "drizzle-orm";
import type { Database } from "../../db";
import type { AdminStats, CustomerStats, ShopOwnerStats, WinemakerStats } from "./stats.schema";

export async function getCustomerStats(db: Database, userId: string): Promise<CustomerStats> {
  const [ordersResult, eventsResult, reviewsResult] = await Promise.all([
    db
      .select({ ordersCount: count(), totalSpent: sum(orders.totalPrice) })
      .from(orders)
      .where(
        and(eq(orders.userId, userId), isNull(orders.deletedAt), ne(orders.status, "cancelled"))
      ),

    db
      .select({ eventsAttended: count() })
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.userId, userId), isNull(eventRegistrations.deletedAt))),

    db
      .select({ reviewsWritten: count() })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), isNull(reviews.deletedAt))),
  ]);

  return {
    eventsAttended: Number(eventsResult[0]?.eventsAttended ?? 0),
    ordersCount: Number(ordersResult[0]?.ordersCount ?? 0),
    reviewsWritten: Number(reviewsResult[0]?.reviewsWritten ?? 0),
    role: "customer",
    totalSpent: Number.parseFloat(ordersResult[0]?.totalSpent ?? "0") || 0,
  };
}

export async function getWinemakerStats(
  db: Database,
  winemakerId: string
): Promise<WinemakerStats> {
  const [winesResult, eventsResult, agreementsResult, reviewResult] = await Promise.all([
    db
      .select({ totalStock: sum(wines.quantity), wineCount: count() })
      .from(wines)
      .where(and(eq(wines.winemakerId, winemakerId), isNull(wines.deletedAt))),

    db
      .select({ cnt: count(), status: events.status })
      .from(events)
      .where(and(eq(events.winemakerId, winemakerId), isNull(events.deletedAt)))
      .groupBy(events.status),

    db
      .select({ cnt: count(), status: supplyAgreements.status })
      .from(supplyAgreements)
      .where(and(eq(supplyAgreements.winemakerId, winemakerId), isNull(supplyAgreements.deletedAt)))
      .groupBy(supplyAgreements.status),

    db
      .select({ avgScore: avg(reviews.rating) })
      .from(reviews)
      .where(
        and(
          eq(reviews.entityId, winemakerId),
          eq(reviews.entityType, "winemaker"),
          isNull(reviews.deletedAt)
        )
      ),
  ]);

  const eventsByStatus = { approved: 0, pending: 0, rejected: 0 };
  for (const row of eventsResult) {
    eventsByStatus[row.status as keyof typeof eventsByStatus] = Number(row.cnt);
  }

  const supplyAgreementsByStatus = { approved: 0, pending: 0, rejected: 0 };
  for (const row of agreementsResult) {
    supplyAgreementsByStatus[row.status as keyof typeof supplyAgreementsByStatus] = Number(row.cnt);
  }

  const rawAvg = reviewResult[0]?.avgScore;

  return {
    avgReviewScore: rawAvg !== null && rawAvg !== undefined ? Number.parseFloat(rawAvg) : null,
    eventsByStatus,
    role: "winemaker",
    supplyAgreementsByStatus,
    totalStock: Number(winesResult[0]?.totalStock ?? 0),
    wineCount: Number(winesResult[0]?.wineCount ?? 0),
  };
}

export async function getShopOwnerStats(
  db: Database,
  ownerUserId: string
): Promise<ShopOwnerStats> {
  const ownedShops = await db
    .select({ id: shops.id })
    .from(shops)
    .where(and(eq(shops.ownerUserId, ownerUserId), isNull(shops.deletedAt)));

  const shopIds = ownedShops.map((s) => s.id);

  if (shopIds.length === 0) {
    return {
      orderItemsProcessed: 0,
      productsByType: { bundles: 0, standard: 0 },
      revenue: 0,
      role: "shop_owner",
      shopsCount: 0,
      supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
      totalStockValue: 0,
    };
  }

  const [productsResult, stockResult, orderItemsCountResult, revenueResult, agreementsResult] =
    await Promise.all([
      db
        .select({ cnt: count(), isBundle: products.isBundle })
        .from(products)
        .where(and(inArray(products.shopId, shopIds), isNull(products.deletedAt)))
        .groupBy(products.isBundle),

      db
        .select({
          totalStockValue: sql<string | null>`SUM(${products.price} * ${products.quantity})`,
        })
        .from(products)
        .where(and(inArray(products.shopId, shopIds), isNull(products.deletedAt))),

      db
        .select({ orderItemsProcessed: count() })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            inArray(orderItems.shopId, shopIds),
            inArray(orders.status, ["confirmed", "shipped", "delivered"]),
            isNull(orderItems.deletedAt)
          )
        ),

      db
        .select({
          revenue: sql<
            string | null
          >`SUM(${orderItems.unitPriceAtPurchase} * ${orderItems.quantity})`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            inArray(orderItems.shopId, shopIds),
            inArray(orders.status, ["confirmed", "shipped", "delivered"]),
            isNull(orderItems.deletedAt)
          )
        ),

      db
        .select({ cnt: count(), status: supplyAgreements.status })
        .from(supplyAgreements)
        .where(and(inArray(supplyAgreements.shopId, shopIds), isNull(supplyAgreements.deletedAt)))
        .groupBy(supplyAgreements.status),
    ]);

  const productsByType = { bundles: 0, standard: 0 };
  for (const row of productsResult) {
    if (row.isBundle) productsByType.bundles = Number(row.cnt);
    else productsByType.standard = Number(row.cnt);
  }

  const supplyAgreementsByStatus = { approved: 0, pending: 0, rejected: 0 };
  for (const row of agreementsResult) {
    supplyAgreementsByStatus[row.status as keyof typeof supplyAgreementsByStatus] = Number(row.cnt);
  }

  return {
    orderItemsProcessed: Number(orderItemsCountResult[0]?.orderItemsProcessed ?? 0),
    productsByType,
    revenue: Number.parseFloat(revenueResult[0]?.revenue ?? "0") || 0,
    role: "shop_owner",
    shopsCount: shopIds.length,
    supplyAgreementsByStatus,
    totalStockValue: Number.parseFloat(stockResult[0]?.totalStockValue ?? "0") || 0,
  };
}

export async function getAdminStats(db: Database): Promise<AdminStats> {
  const [
    roleCountsResult,
    revenueResult,
    productsCountResult,
    shopsCountResult,
    winemakersCountResult,
    eventsCountResult,
    roleRequestsCountResult,
    pendingEventsCountResult,
    deletedReviewsCountResult,
  ] = await Promise.all([
    db
      .select({ cnt: count(), role: userRoles.role })
      .from(userRoles)
      .where(isNull(userRoles.deletedAt))
      .groupBy(userRoles.role),

    db
      .select({
        totalRevenue: sql<string | null>`SUM(${orders.totalPrice})`,
      })
      .from(orders)
      .where(
        and(inArray(orders.status, ["confirmed", "shipped", "delivered"]), isNull(orders.deletedAt))
      ),

    db.select({ cnt: count() }).from(products).where(isNull(products.deletedAt)),
    db.select({ cnt: count() }).from(shops).where(isNull(shops.deletedAt)),
    db.select({ cnt: count() }).from(winemakers).where(isNull(winemakers.deletedAt)),
    db.select({ cnt: count() }).from(events).where(isNull(events.deletedAt)),

    db
      .select({ cnt: count() })
      .from(roleRequests)
      .where(and(eq(roleRequests.status, "pending"), isNull(roleRequests.deletedAt))),

    db
      .select({ cnt: count() })
      .from(events)
      .where(and(eq(events.status, "pending"), isNull(events.deletedAt))),

    db.select({ cnt: count() }).from(reviews).where(isNotNull(reviews.deletedAt)),
  ]);

  const usersByRole = { admin: 0, customer: 0, shop_owner: 0, winemaker: 0 };
  for (const row of roleCountsResult) {
    const role = row.role as keyof typeof usersByRole;
    if (role in usersByRole) usersByRole[role] = Number(row.cnt);
  }

  return {
    deletedReviews: Number(deletedReviewsCountResult[0]?.cnt ?? 0),
    pendingEvents: Number(pendingEventsCountResult[0]?.cnt ?? 0),
    pendingRoleRequests: Number(roleRequestsCountResult[0]?.cnt ?? 0),
    role: "admin",
    totalEvents: Number(eventsCountResult[0]?.cnt ?? 0),
    totalProducts: Number(productsCountResult[0]?.cnt ?? 0),
    totalRevenue: Number.parseFloat(revenueResult[0]?.totalRevenue ?? "0") || 0,
    totalShops: Number(shopsCountResult[0]?.cnt ?? 0),
    totalWinemakers: Number(winemakersCountResult[0]?.cnt ?? 0),
    usersByRole,
  };
}
