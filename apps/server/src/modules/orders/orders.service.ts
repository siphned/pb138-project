import type { Order, orders } from "../../db/schema";
import type { CartWithItems } from "../carts/carts.repository";
import { cartsService } from "../carts/carts.service";
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
    { userId, sessionId }: { userId?: string; sessionId?: string },
    data: CheckoutData
  ): Promise<Order> {
    let cart: CartWithItems | undefined | null = null;
    if (userId) {
      cart = await cartsService.getCartForUser(userId);
    } else if (sessionId) {
      cart = await cartsService.getCartForSession(sessionId);
    }

    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    const items: CreateOrderItem[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      // Check if product is deleted
      if (cartItem.product.deletedAt !== null) {
        throw new Error(`PRODUCT_DELETED:${cartItem.product.name}`);
      }

      if (cartItem.product.quantity < cartItem.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${cartItem.product.name}`);
      }

      items.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        shopId: cartItem.product.shopId,
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
      billingAddress: data.billingAddress || data.shippingAddress,
      deliveryType: data.deliveryType,
      discount,
      guestEmail: data.guestEmail,
      guestName: data.guestName,
      guestSessionId: sessionId,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      shippingAddress: data.shippingAddress,
      shippingFee,
      status: "pending",
      totalPrice,
      userId,
    };

    const order = await ordersRepository.create(orderData, items);

    // Clear cart after successful order
    if (userId) {
      await cartsService.clearCart(userId);
    } else if (sessionId) {
      await cartsService.clearCartBySession(sessionId);
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

    return ordersRepository.updateStatus(orderId, status);
  },
};
