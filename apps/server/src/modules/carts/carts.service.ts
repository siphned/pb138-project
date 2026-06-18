import type { Cart } from "@repo/shared/schemas";
import { db } from "../../db";
import { InsufficientStockError, ProductNotFoundError } from "../products/products.errors";
import * as productsRepo from "../products/products.repository";
import { CartNotFoundError } from "./carts.errors";
import type { CartWithItems } from "./carts.repository";
import * as cartsRepo from "./carts.repository";

export class CartsService {
  async addItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    const product = await productsRepo.findById(db, productId);
    if (!product) throw new ProductNotFoundError(productId);

    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepo.findByUserId(db, userId);
      if (!cart) cart = await cartsRepo.create(db, { userId });
    } else if (sessionId) {
      cart = await cartsRepo.findBySessionId(db, sessionId);
      if (!cart) cart = await cartsRepo.create(db, { sessionId });
    }

    if (!cart) throw new CartNotFoundError();

    // addItem accumulates onto any existing line, so validate the resulting total
    // against available stock — not just the amount being added.
    const items = await cartsRepo.getCartItems(db, cart.id);
    const current = items.find((i) => i.productId === productId)?.quantity ?? 0;
    if (product.quantity < current + quantity) throw new InsufficientStockError(product.name);

    await cartsRepo.addItem(db, cart.id, productId, quantity);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await cartsRepo.findByUserId(db, userId);
    if (cart) {
      await cartsRepo.clearCart(db, cart.id);
    }
  }

  async clearCartBySession(sessionId: string): Promise<void> {
    const cart = await cartsRepo.findBySessionId(db, sessionId);
    if (cart) {
      await cartsRepo.clearCart(db, cart.id);
    }
  }

  async getCartForSession(sessionId: string): Promise<CartWithItems | undefined> {
    let cart = await cartsRepo.findBySessionId(db, sessionId);
    if (!cart) {
      cart = await cartsRepo.create(db, { sessionId });
    }
    return cartsRepo.findByIdWithItems(db, cart.id);
  }

  async getCartForUser(userId: string): Promise<CartWithItems | undefined> {
    let cart = await cartsRepo.findByUserId(db, userId);
    if (!cart) {
      cart = await cartsRepo.create(db, { userId });
    }
    return cartsRepo.findByIdWithItems(db, cart.id);
  }

  async mergeOnLogin(userId: string, sessionId: string): Promise<void> {
    const guestCart = await cartsRepo.findBySessionId(db, sessionId);
    if (!guestCart) return;

    let userCart = await cartsRepo.findByUserId(db, userId);
    if (!userCart) {
      userCart = await cartsRepo.create(db, { userId });
    }

    const fromCartId = guestCart.id;
    const toCartId = userCart.id;

    await db.transaction(async (tx) => {
      const fromItems = await cartsRepo.getCartItems(tx, fromCartId);

      for (const item of fromItems) {
        await cartsRepo.addItem(tx, toCartId, item.productId, item.quantity);
      }

      await cartsRepo.clearCart(tx, fromCartId);
      await cartsRepo.deleteCart(tx, fromCartId);
    });
  }

  async removeItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepo.findByUserId(db, userId);
    } else if (sessionId) {
      cart = await cartsRepo.findBySessionId(db, sessionId);
    }

    if (!cart) throw new CartNotFoundError();

    await cartsRepo.removeItem(db, cart.id, productId);
  }

  async updateItemQuantity(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepo.findByUserId(db, userId);
    } else if (sessionId) {
      cart = await cartsRepo.findBySessionId(db, sessionId);
    }

    if (!cart) throw new CartNotFoundError();

    if (quantity <= 0) {
      await cartsRepo.removeItem(db, cart.id, productId);
      return;
    }

    const product = await productsRepo.findById(db, productId);
    if (!product) throw new ProductNotFoundError(productId);
    if (product.quantity < quantity) throw new InsufficientStockError(product.name);

    await cartsRepo.setItemQuantity(db, cart.id, productId, quantity);
  }
}

export const cartsService = new CartsService();
