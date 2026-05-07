import type { Address, Order, Product } from "@repo/shared/schemas";
import { orderItems, orders } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "../../db";

export type OrderItemWithProduct = typeof orderItems.$inferSelect & {
  product: Product;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
  shippingAddress: Address;
  billingAddress: Address;
};

export interface CreateOrderAddress {
  country: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
}

export interface CreateOrderItem {
  shopId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
}

export async function createOrder(db: Database, data: typeof orders.$inferInsert): Promise<Order> {
  const [order] = await db.insert(orders).values(data).returning();
  if (!order) throw new Error("Failed to create order");
  return order;
}

export async function createOrderItems(
  db: Database,
  data: (typeof orderItems.$inferInsert)[]
): Promise<void> {
  if (data.length === 0) return;
  await db.insert(orderItems).values(data);
}

export async function findById(db: Database, id: string): Promise<OrderWithItems | undefined> {
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), isNull(orders.deletedAt)),
    with: {
      billingAddress: true,
      items: {
        with: {
          product: {
            columns: { deletedAt: true, id: true, name: true },
          },
        },
      },
      shippingAddress: true,
    },
  });

  if (order) {
    const typedOrder = order as OrderWithItems;
    if (typedOrder.items) {
      typedOrder.items = typedOrder.items.filter((item) => item.product && !item.product.deletedAt);
    }
    return typedOrder;
  }
  return undefined;
}

export async function listForShop(db: Database, shopId: string): Promise<{ order: Order }[]> {
  return db
    .selectDistinct({ order: orders })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(eq(orderItems.shopId, shopId), isNull(orders.deletedAt), isNull(orderItems.deletedAt))
    );
}

export async function listForUser(db: Database, userId: string): Promise<Order[]> {
  return db.query.orders.findMany({
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    where: and(eq(orders.userId, userId), isNull(orders.deletedAt)),
  });
}

export async function updateStatus(
  db: Database,
  id: string,
  status: typeof orders.$inferSelect.status
): Promise<Order> {
  const [updated] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  if (!updated) throw new Error("Order not found");
  return updated;
}
