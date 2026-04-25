import { cartsRepository } from "../carts/carts.repository";
import { shopsRepository } from "../shops/shops.repository";
import type { OrderWithItems } from "./orders.repository";
import { ordersRepository } from "./orders.repository";

type CheckoutBody = {
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
  deliveryType: "pickup" | "shipping";
  shippingAddressId?: string;
  newShippingAddress?: {
    country: string;
    city: string;
    street: string;
    postalCode: string;
    houseNumber: string;
  };
  billingAddressId?: string;
  newBillingAddress?: {
    country: string;
    city: string;
    street: string;
    postalCode: string;
    houseNumber: string;
  };
};

export const ordersService = {
  async checkout(userId: string, body: CheckoutBody): Promise<OrderWithItems> {
    const cart = await cartsRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    if (!body.shippingAddressId && !body.newShippingAddress)
      throw new Error("MISSING_SHIPPING_ADDRESS");
    if (!body.billingAddressId && !body.newBillingAddress)
      throw new Error("MISSING_BILLING_ADDRESS");

    const totalPrice = cart.items
      .reduce((sum, item) => sum + Number.parseFloat(item.product.price) * item.quantity, 0)
      .toFixed(2);

    const itemsData = cart.items.map((item) => ({
      shopId: item.product.shopId,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceAtPurchase: item.product.price,
    }));

    const order = await ordersRepository.createOrderWithItems(
      {
        userId,
        shippingAddress: body.newShippingAddress ?? (body.shippingAddressId as string),
        billingAddress: body.newBillingAddress ?? (body.billingAddressId as string),
        paymentMethod: body.paymentMethod,
        deliveryType: body.deliveryType,
        totalPrice,
      },
      itemsData,
      cart.id
    );

    const full = await ordersRepository.findOrderById(order.id);
    if (!full) throw new Error("Unexpected: order not found after creation");
    return full;
  },

  async getMyOrders(userId: string): Promise<OrderWithItems[]> {
    return ordersRepository.findOrdersByUserId(userId);
  },

  async getOrderById(userId: string, orderId: string): Promise<OrderWithItems> {
    const order = await ordersRepository.findOrderById(orderId);
    if (!order || order.userId !== userId) throw new Error("NOT_FOUND");
    return order;
  },

  async updateOrderItemStatus(
    shopOwnerUserId: string,
    orderId: string,
    itemId: string,
    newStatus: "confirmed" | "shipped" | "delivered" | "cancelled"
  ): Promise<OrderWithItems> {
    const shop = await shopsRepository.findByOwnerUserId(shopOwnerUserId);
    if (!shop) throw new Error("FORBIDDEN");

    const item = await ordersRepository.findOrderItem(itemId);
    if (!item || item.orderId !== orderId) throw new Error("NOT_FOUND");
    if (item.shopId !== shop.id) throw new Error("FORBIDDEN");

    await ordersRepository.updateOrderItemStatus(itemId, newStatus);

    const order = await ordersRepository.findOrderById(orderId);
    if (!order) throw new Error("Unexpected: order not found after status update");
    return order;
  },
};
