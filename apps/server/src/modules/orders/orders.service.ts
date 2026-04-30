import type { Order, orders } from "@repo/shared/schemas";
import type { CartWithItems } from "../carts/carts.repository";
import { type CartsService, cartsService } from "../carts/carts.service";
import { emailService, type IEmailService } from "../email/email.service";
import { type IUsersRepository, usersRepository } from "../users/users.repository";
import {
  type CreateOrderData,
  type CreateOrderItem,
  type IOrdersRepository,
  type OrderWithItems,
  ordersRepository,
} from "./orders.repository";

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

export class OrdersService {
  constructor(
    private ordersRepo: IOrdersRepository,
    private cartsService: CartsService,
    private emailService: IEmailService,
    private usersRepo: IUsersRepository
  ) {}

  async afterCheckout(
    order: Order,
    _items: CreateOrderItem[],
    userId?: string,
    data?: CheckoutData
  ) {
    const orderWithItems = await this.ordersRepo.findById(order.id);
    if (orderWithItems) {
      const emailData = {
        customerName: userId ? "" : data?.guestName || "Guest",
        items: orderWithItems.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPriceAtPurchase,
        })),
        orderId: order.id,
        totalPrice: order.totalPrice,
      };

      if (userId) {
        const user = await this.usersRepo.findById(userId);
        if (user) {
          emailData.customerName = user.fname;
          await this.emailService.sendOrderConfirmation(user.email, emailData).catch(() => {
            /* ignore */
          });
        }
      } else if (data?.guestEmail) {
        await this.emailService.sendOrderConfirmation(data.guestEmail, emailData).catch(() => {
          /* ignore */
        });
      }
    }

    if (userId) {
      await this.cartsService.clearCart(userId);
    } else if (order.guestSessionId) {
      await this.cartsService.clearCartBySession(order.guestSessionId);
    }
  }

  async createOrder(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    data: CheckoutData
  ): Promise<Order> {
    const cart = await this.getCart(userId, sessionId);
    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    const { items, totalPrice } = this.processCartItems(cart);

    const orderData: CreateOrderData = {
      billingAddress: data.billingAddress || data.shippingAddress,
      deliveryType: data.deliveryType,
      discount: "0.00",
      guestEmail: data.guestEmail,
      guestName: data.guestName,
      guestSessionId: sessionId,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      shippingAddress: data.shippingAddress,
      shippingFee: "10.00",
      status: "pending",
      totalPrice,
      userId,
    };

    const order = await this.ordersRepo.create(orderData, items);

    // Non-blocking operations
    this.afterCheckout(order, items, userId, data).catch(() => {
      /* ignore */
    });

    return order;
  }

  async getCart(userId?: string, sessionId?: string) {
    if (userId) return await this.cartsService.getCartForUser(userId);
    if (sessionId) return await this.cartsService.getCartForSession(sessionId);
    return null;
  }

  async getOrder(id: string, userId: string): Promise<OrderWithItems> {
    const order = await this.ordersRepo.findById(id);
    if (!order) throw new Error("NOT_FOUND");
    if (order.userId !== userId) throw new Error("FORBIDDEN");
    return order;
  }

  processCartItems(cart: CartWithItems) {
    const items: CreateOrderItem[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
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

    const shippingFee = 10;
    const totalPrice = (subtotal + shippingFee).toFixed(2);

    return { items, totalPrice };
  }

  async updateStatus(
    orderId: string,
    _userId: string,
    status: typeof orders.$inferSelect.status
  ): Promise<Order> {
    const order = await this.ordersRepo.findById(orderId);
    if (!order) throw new Error("NOT_FOUND");

    const updated = await this.ordersRepo.updateStatus(orderId, status);

    if (order.userId) {
      const user = await this.usersRepo.findById(order.userId);
      if (user) {
        await this.emailService
          .sendOrderStatusUpdate(user.email, {
            orderId: order.id,
            status: updated.status,
          })
          .catch(() => {
            /* ignore */
          });
      }
    } else if (order.guestEmail) {
      await this.emailService
        .sendOrderStatusUpdate(order.guestEmail, {
          orderId: order.id,
          status: updated.status,
        })
        .catch(() => {
          /* ignore */
        });
    }

    return updated;
  }
}

export const ordersService = new OrdersService(
  ordersRepository,
  cartsService,
  emailService,
  usersRepository
);
