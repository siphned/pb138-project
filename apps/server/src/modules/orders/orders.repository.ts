import { eq } from "drizzle-orm";
import { db } from "../../db";
import type { Address, Order, OrderItem, Product } from "../../db/schema";
import { addresses, cartItems as cartItemsTable, orderItems, orders } from "../../db/schema";

export type OrderItemWithProduct = OrderItem & {
  product: Pick<Product, "id" | "name">;
};

export type OrderWithItems = Order & { items: OrderItemWithProduct[] };

type AddressInput = {
  country: string;
  city: string;
  street: string;
  postalCode: string;
  houseNumber: string;
};

type CreateOrderData = {
  userId: string;
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
  deliveryType: "pickup" | "shipping";
  totalPrice: string;
};

type CreateOrderItemData = {
  shopId: string;
  productId: string;
  quantity: number;
  unitPriceAtPurchase: string;
};

export const ordersRepository = {
  async insertAddress(data: AddressInput): Promise<Address> {
    const [address] = await db.insert(addresses).values(data).returning();
    if (!address) throw new Error("Address insert returned no rows");
    return address;
  },

  async createOrderWithItems(
    orderData: CreateOrderData,
    itemsData: CreateOrderItemData[],
    cartId: string
  ): Promise<Order> {
    return db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          ...orderData,
          status: "pending",
          paymentStatus: "pending",
          shippingFee: "0",
          discount: "0",
        })
        .returning();
      if (!order) throw new Error("Order insert returned no rows");

      await tx.insert(orderItems).values(
        itemsData.map((i) => ({
          ...i,
          orderId: order.id,
          status: "pending" as const,
        }))
      );

      await tx.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));

      return order;
    });
  },

  findOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    return db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true } },
          },
        },
      },
    }) as Promise<OrderWithItems[]>;
  },

  findOrderById(orderId: string): Promise<OrderWithItems | undefined> {
    return db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true } },
          },
        },
      },
    }) as Promise<OrderWithItems | undefined>;
  },

  findOrderItem(itemId: string): Promise<OrderItem | undefined> {
    return db.query.orderItems.findFirst({
      where: eq(orderItems.id, itemId),
    });
  },

  async updateOrderItemStatus(
    itemId: string,
    newStatus: "confirmed" | "shipped" | "delivered" | "cancelled"
  ): Promise<OrderItem> {
    const [updated] = await db
      .update(orderItems)
      .set({ status: newStatus })
      .where(eq(orderItems.id, itemId))
      .returning();
    if (!updated) throw new Error("OrderItem not found");
    return updated;
  },
};
