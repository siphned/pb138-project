import type { Address, Order, Product } from "@repo/shared/schemas";
import { addresses, orderItems, orders } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import {
  type IProductsRepository,
  productsRepository,
  type Transaction,
} from "../products/products.repository";

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

export interface IOrdersRepository {
  create(data: CreateOrderData, items: CreateOrderItem[]): Promise<Order>;
  findById(id: string): Promise<OrderWithItems | undefined>;
  listForShop(shopId: string): Promise<{ order: Order }[]>;
  listForUser(userId: string): Promise<Order[]>;
  updateStatus(id: string, status: typeof orders.$inferSelect.status): Promise<Order>;
}

export class OrdersRepository implements IOrdersRepository {
  constructor(private productsRepo: IProductsRepository) {}

  async create(data: CreateOrderData, items: CreateOrderItem[]): Promise<Order> {
    return db.transaction(async (tx) => {
      const [shippingAddr] = await tx.insert(addresses).values(data.shippingAddress).returning();
      const [billingAddr] = await tx.insert(addresses).values(data.billingAddress).returning();

      if (!(shippingAddr && billingAddr)) throw new Error("Failed to create frozen addresses");

      const orderData: typeof orders.$inferInsert = {
        billingAddressId: billingAddr.id,
        deliveryType: data.deliveryType,
        discount: data.discount,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        guestSessionId: data.guestSessionId,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        shippingAddressId: shippingAddr.id,
        shippingFee: data.shippingFee,
        status: data.status,
        totalPrice: data.totalPrice,
        userId: data.userId,
      };

      const [order] = await tx.insert(orders).values(orderData).returning();
      if (!order) throw new Error("Failed to create order");

      const orderItemsData: (typeof orderItems.$inferInsert)[] = items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        shopId: item.shopId,
        unitPriceAtPurchase: item.unitPrice,
      }));

      await tx.insert(orderItems).values(orderItemsData);

      // Decrement stock for each item
      for (const item of items) {
        await this.productsRepo.decrementStock(tx as Transaction, item.productId, item.quantity);
      }

      return order;
    });
  }

  async findById(id: string): Promise<OrderWithItems | undefined> {
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
        typedOrder.items = typedOrder.items.filter(
          (item) => item.product && !item.product.deletedAt
        );
      }
      return typedOrder;
    }
    return undefined;
  }

  async listForShop(shopId: string): Promise<{ order: Order }[]> {
    return db
      .selectDistinct({ order: orders })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(eq(orderItems.shopId, shopId), isNull(orders.deletedAt), isNull(orderItems.deletedAt))
      );
  }

  async listForUser(userId: string): Promise<Order[]> {
    return db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      where: and(eq(orders.userId, userId), isNull(orders.deletedAt)),
    });
  }

  async updateStatus(id: string, status: typeof orders.$inferSelect.status): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!updated) throw new Error("Order not found");
    return updated;
  }
}

export const ordersRepository = new OrdersRepository(productsRepository);
