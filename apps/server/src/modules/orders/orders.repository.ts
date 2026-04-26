import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { Address, Order, Product } from "../../db/schema";
import { addresses, orderItems, orders } from "../../db/schema";

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

export interface CreateOrderData {
  userId?: string;
  guestSessionId?: string;
  guestEmail?: string;
  guestName?: string;
  shippingFee: string;
  discount: string;
  paymentStatus: typeof orders.$inferSelect.paymentStatus;
  paymentMethod: typeof orders.$inferSelect.paymentMethod;
  totalPrice: string;
  status: typeof orders.$inferSelect.status;
  deliveryType: typeof orders.$inferSelect.deliveryType;
  shippingAddress: CreateOrderAddress;
  billingAddress: CreateOrderAddress;
}

export const ordersRepository = {
  findById(id: string): Promise<OrderWithItems | undefined> {
    return db.query.orders.findFirst({
      where: and(eq(orders.id, id), isNull(orders.deletedAt)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    }) as Promise<OrderWithItems | undefined>;
  },

  listForUser(userId: string): Promise<Order[]> {
    return db.query.orders.findMany({
      where: and(eq(orders.userId, userId), isNull(orders.deletedAt)),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
  },

  listForShop(shopId: string): Promise<{ order: Order }[]> {
    return db
      .selectDistinct({ order: orders })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(and(eq(orderItems.shopId, shopId), isNull(orders.deletedAt)));
  },

  async create(data: CreateOrderData, items: CreateOrderItem[]): Promise<Order> {
    return db.transaction(async (tx) => {
      const [shippingAddr] = await tx.insert(addresses).values(data.shippingAddress).returning();
      const [billingAddr] = await tx.insert(addresses).values(data.billingAddress).returning();

      if (!(shippingAddr && billingAddr)) throw new Error("Failed to create frozen addresses");

      const orderData: typeof orders.$inferInsert = {
        userId: data.userId,
        guestSessionId: data.guestSessionId,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        shippingFee: data.shippingFee,
        discount: data.discount,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        totalPrice: data.totalPrice,
        status: data.status,
        deliveryType: data.deliveryType,
        shippingAddressId: shippingAddr.id,
        billingAddressId: billingAddr.id,
      };

      const [order] = await tx.insert(orders).values(orderData).returning();
      if (!order) throw new Error("Failed to create order");

      const orderItemsData: (typeof orderItems.$inferInsert)[] = items.map((item) => ({
        orderId: order.id,
        shopId: item.shopId,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAtPurchase: item.unitPrice,
      }));

      await tx.insert(orderItems).values(orderItemsData);

      return order;
    });
  },

  async updateStatus(id: string, status: typeof orders.$inferSelect.status): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!updated) throw new Error("Order not found");
    return updated;
  },
};
