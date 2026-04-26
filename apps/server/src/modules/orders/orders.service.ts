import type { Order, orders } from "../../db/schema";
import { cartsService } from "../carts/carts.service";
import { emailService } from "../email";
import { usersRepository } from "../users/users.repository";
import type { CreateOrderData, CreateOrderItem, OrderWithItems } from "./orders.repository";
import { ordersRepository } from "./orders.repository";

export interface CheckoutData {
  guestEmail?: string;
  guestName?: string;
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
  deliveryType: "pickup" | "shipping";
  shippingAddress: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  };
  billingAddress?: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  };
}

export const ordersService = {
  async createOrder(
    {
      userId,
      sessionId,
      userEmail,
      customerName,
    }: {
      userId?: string;
      sessionId?: string;
      userEmail?: string;
      customerName?: string;
    },
    data: CheckoutData
  ): Promise<Order> {
    const cart = userId
      ? await cartsService.getCartForUser(userId)
      : sessionId
        ? await cartsService.getCartForSession(sessionId)
        : null;

    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    const items: CreateOrderItem[] = [];
    const emailItems: { name: string; quantity: number; unitPrice: string }[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      if (cartItem.product.quantity < cartItem.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${cartItem.product.name}`);
      }

      items.push({
        shopId: cartItem.product.shopId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.price,
      });

      emailItems.push({
        name: cartItem.product.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.price,
      });

      subtotal += Number.parseFloat(cartItem.product.price) * cartItem.quantity;
    }

    const shippingFee = "10.00";
    const discount = "0.00";
    const totalPrice = (
      subtotal +
      Number.parseFloat(shippingFee) -
      Number.parseFloat(discount)
    ).toFixed(2);

    const orderData: CreateOrderData = {
      userId,
      guestSessionId: sessionId,
      guestEmail: data.guestEmail,
      guestName: data.guestName,
      shippingFee,
      discount,
      paymentStatus: "pending",
      paymentMethod: data.paymentMethod,
      totalPrice,
      status: "pending",
      deliveryType: data.deliveryType,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress || data.shippingAddress,
    };

    const order = await ordersRepository.create(orderData, items);

    const recipientEmail = userEmail ?? data.guestEmail;
    const recipientName = customerName ?? data.guestName ?? "Customer";
    if (recipientEmail) {
      emailService
        .sendOrderConfirmation(recipientEmail, {
          customerName: recipientName,
          orderId: order.id,
          items: emailItems,
          totalPrice,
        })
        .catch(console.error);
    }

    return order;
  },

  async getOrder(id: string, userId: string): Promise<OrderWithItems> {
    const order = await ordersRepository.findById(id);
    if (!order) throw new Error("NOT_FOUND");

    if (order.userId !== userId) throw new Error("FORBIDDEN");

    return order;
  },

  async updateStatus(
    orderId: string,
    _userId: string,
    status: typeof orders.$inferSelect.status
  ): Promise<Order> {
    const order = await ordersRepository.findById(orderId);
    if (!order) throw new Error("NOT_FOUND");

    const updated = await ordersRepository.updateStatus(orderId, status);

    if (order.userId) {
      usersRepository
        .findById(order.userId)
        .then((user) => {
          if (user) emailService.sendOrderStatusUpdate(user.email, { orderId, status });
        })
        .catch(console.error);
    }

    return updated;
  },
};
