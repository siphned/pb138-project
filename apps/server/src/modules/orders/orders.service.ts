import type { Order } from "@repo/shared/schemas";
import { addresses } from "@repo/shared/schemas";
import { sql } from "drizzle-orm";
import { type Database, db } from "../../db";
import { logger } from "../../utils/logger";
import { cartsService } from "../carts/carts.service";
import { emailService } from "../email/email.service";
import * as productsRepo from "../products/products.repository";
import * as usersRepo from "../users/users.repository";
import type { CreateOrderItem, OrderWithItems } from "./orders.repository";
import * as ordersRepo from "./orders.repository";

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
  async afterCheckout(
    order: Order,
    _items: CreateOrderItem[],
    userId?: string,
    data?: CheckoutData
  ) {
    const orderWithItems = await ordersRepo.findById(db, order.id);
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
        });
      }
    }

    if (userId) {
      await cartsService.clearCart(userId);
    } else if (order.guestSessionId) {
      await cartsService.clearCartBySession(order.guestSessionId);
    }
  }

  async createOrder(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    data: CheckoutData
  ): Promise<Order> {
    // biome-ignore lint/suspicious/noExplicitAny: complex cart type
    let cart: any = null;
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

    // Non-blocking operations
    this.afterCheckout(order, items, userId, data).catch(() => {
      /* ignore */
    });

    return order;
  }

  async getOrder(id: string, userId: string): Promise<OrderWithItems> {
    const order = await ordersRepo.findById(db, id);
    if (!order) throw new Error("NOT_FOUND");
    if (order.userId !== userId) throw new Error("FORBIDDEN");
    return order;
  }

  async updateStatus(orderId: string, _userId: string, status: Order["status"]): Promise<Order> {
    const order = await ordersRepo.findById(db, orderId);
    if (!order) throw new Error("NOT_FOUND");

    const updated = await ordersRepo.updateStatus(db, orderId, status);

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

  // biome-ignore lint/suspicious/noExplicitAny: complex cart type
  private validateAndProcessCart(cart: any) {
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
        await productsRepo.updateWineQuantity(
          tx,
          pw.wineId,
          sql`${sql.raw("quantity")} - ${totalWineNeeded}`
        );
      }
    }
  }
}

export const ordersService = new OrdersService();
