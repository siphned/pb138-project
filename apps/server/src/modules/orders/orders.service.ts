<<<<<<< HEAD
import type { Order } from "@repo/shared/schemas";
import { addresses } from "@repo/shared/schemas";
import { type Database, db } from "../../db";
import { logger } from "../../utils/logger";
import type { CartWithItems } from "../carts/carts.repository";
import { cartsService } from "../carts/carts.service";
import { emailService } from "../email/email.service";
import * as productsRepo from "../products/products.repository";
import * as shopsRepo from "../shops/shops.repository";
import * as usersRepo from "../users/users.repository";
import type { CreateOrderItem, OrderWithItems } from "./orders.repository";
import * as ordersRepo from "./orders.repository";

const VALID_TRANSITIONS: Record<string, string[]> = {
  cancelled: [],
  confirmed: ["shipped", "cancelled"],
  delivered: [],
  pending: ["confirmed", "cancelled"],
  shipped: ["delivered", "cancelled"],
};
=======
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
>>>>>>> origin/main

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
<<<<<<< HEAD
=======
  constructor(
    private ordersRepo: IOrdersRepository,
    private cartsService: CartsService,
    private emailService: IEmailService,
    private usersRepo: IUsersRepository
  ) {}

>>>>>>> origin/main
  async afterCheckout(
    order: Order,
    _items: CreateOrderItem[],
    userId?: string,
    data?: CheckoutData
  ) {
<<<<<<< HEAD
    const orderWithItems = await ordersRepo.findById(db, order.id);
=======
    const orderWithItems = await this.ordersRepo.findById(order.id);
>>>>>>> origin/main
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
<<<<<<< HEAD
        const user = await usersRepo.findById(db, userId);
        if (user) {
          emailData.customerName = user.fname;
          await emailService.sendOrderConfirmation(user.email, emailData).catch((error) => {
            logger.error(
              {
                email: user.email,
                err: error,
                operation: "sendOrderConfirmation",
                orderId: order.id,
                userId,
              },
              "Failed to send order confirmation email"
            );
          });
        }
      } else if (data?.guestEmail) {
        await emailService.sendOrderConfirmation(data.guestEmail, emailData).catch((error) => {
          logger.error(
            {
              email: data.guestEmail,
              err: error,
              operation: "sendOrderConfirmation",
              orderId: order.id,
            },
            "Failed to send order confirmation email to guest"
          );
=======
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
>>>>>>> origin/main
        });
      }
    }

    if (userId) {
<<<<<<< HEAD
      await cartsService.clearCart(userId);
    } else if (order.guestSessionId) {
      await cartsService.clearCartBySession(order.guestSessionId);
=======
      await this.cartsService.clearCart(userId);
    } else if (order.guestSessionId) {
      await this.cartsService.clearCartBySession(order.guestSessionId);
>>>>>>> origin/main
    }
  }

  async createOrder(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    data: CheckoutData
  ): Promise<Order> {
<<<<<<< HEAD
    let cart: CartWithItems | undefined;
    if (userId) {
      cart = await cartsService.getCartForUser(userId);
    } else if (sessionId) {
      cart = await cartsService.getCartForSession(sessionId);
    }
    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    const { items, totalPrice } = this.validateAndProcessCart(cart);

    const order = await db.transaction(async (tx) => {
      const [shippingAddr] = await tx.insert(addresses).values(data.shippingAddress).returning();
      const [billingAddr] = await tx
        .insert(addresses)
        .values(data.billingAddress || data.shippingAddress)
        .returning();

      if (!(shippingAddr && billingAddr)) throw new Error("Failed to create frozen addresses");

      const createdOrder = await ordersRepo.createOrder(tx, {
        billingAddressId: billingAddr.id,
        deliveryType: data.deliveryType,
        discount: "0.00",
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        guestSessionId: sessionId,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
        shippingAddressId: shippingAddr.id,
        shippingFee: "10.00",
        status: "pending",
        totalPrice,
        userId,
      });

      await ordersRepo.createOrderItems(
        tx,
        items.map((item) => ({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          shopId: item.shopId,
          unitPriceAtPurchase: item.unitPrice,
        }))
      );

      await this.updateStockAfterOrder(tx, items);

      return createdOrder;
    });
=======
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
>>>>>>> origin/main

    // Non-blocking operations
    this.afterCheckout(order, items, userId, data).catch(() => {
      /* ignore */
    });

    return order;
  }

<<<<<<< HEAD
  async getOrder(id: string, userId: string, isAdmin = false): Promise<OrderWithItems> {
    const order = await ordersRepo.findById(db, id);
    if (!order) throw new Error("NOT_FOUND");
    if (!isAdmin && order.userId !== userId) throw new Error("FORBIDDEN");
    return order;
  }

  async listForUser(userId: string): Promise<Order[]> {
    return ordersRepo.listForUser(db, userId);
  }

  async listForShop(shopId: string, requesterId: string, isAdmin: boolean): Promise<Order[]> {
    if (!isAdmin) {
      const shop = await shopsRepo.findById(db, shopId);
      if (!shop) throw new Error("NOT_FOUND");
      if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");
    }
    const rows = await ordersRepo.listForShop(db, shopId);
    return rows.map((r) => r.order);
  }

  async updateStatus(
    orderId: string,
    userId: string,
    newStatus: Order["status"],
    isAdmin: boolean
  ): Promise<Order> {
    const order = await ordersRepo.findById(db, orderId);
    if (!order) throw new Error("NOT_FOUND");

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) throw new Error("INVALID_TRANSITION");

    if (!isAdmin) {
      const userShops = await shopsRepo.findAllByOwnerUserId(db, userId);
      const userShopIds = new Set(userShops.map((s) => s.id));
      const ownsItem = order.items.some((item) => userShopIds.has(item.shopId));
      if (!ownsItem) throw new Error("FORBIDDEN");
    }

    const updated = await ordersRepo.updateStatus(db, orderId, newStatus);

    if (order.userId) {
      const user = await usersRepo.findById(db, order.userId);
      if (user) {
        await emailService
          .sendOrderStatusUpdate(user.email, {
            orderId: order.id,
            status: updated.status,
          })
          .catch(() => {
            /* ignore */
          });
      }
    } else if (order.guestEmail) {
      await emailService
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

  private validateAndProcessCart(cart: CartWithItems) {
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
    return { items, totalPrice };
  }

  private async updateStockAfterOrder(tx: Database, items: CreateOrderItem[]) {
    for (const item of items) {
      // Use atomic decrement to prevent race conditions
      await productsRepo.decrementStock(tx, item.productId, item.quantity);

      const product = await productsRepo.findById(tx, item.productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      for (const pw of product.productWines) {
        const totalWineNeeded = pw.quantity * item.quantity;
        const currentWineQty = await productsRepo.getWineQuantityForUpdate(tx, pw.wineId);
        if (currentWineQty === undefined || currentWineQty < totalWineNeeded) {
          throw new Error("INSUFFICIENT_STOCK");
        }
        await productsRepo.updateWineQuantity(tx, pw.wineId, -totalWineNeeded);
      }
    }
  }
}

export const ordersService = new OrdersService();
=======

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
>>>>>>> origin/main
