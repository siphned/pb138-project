import type { Cart } from "../../db/schema";
import { productsRepository } from "../products/products.repository";
import type { CartWithItems } from "./carts.repository";
import { cartsRepository } from "./carts.repository";

export const cartsService = {
  async addItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    // Check if product is deleted
    const isDeleted = await productsRepository.isDeleted(productId);
    if (isDeleted) throw new Error("PRODUCT_DELETED");

    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepository.findByUserId(userId);
      if (!cart) cart = await cartsRepository.create({ userId });
    } else if (sessionId) {
      cart = await cartsRepository.findBySessionId(sessionId);
      if (!cart) cart = await cartsRepository.create({ sessionId });
    }

    if (!cart) throw new Error("Could not find or create cart");

    await cartsRepository.addItem(cart.id, productId, quantity);
  },

  async clearCart(userId: string): Promise<void> {
    const cart = await cartsRepository.findByUserId(userId);
    if (cart) {
      await cartsRepository.clearCart(cart.id);
    }
  },

  async clearCartBySession(sessionId: string): Promise<void> {
    const cart = await cartsRepository.findBySessionId(sessionId);
    if (cart) {
      await cartsRepository.clearCart(cart.id);
    }
  },

  async getCartForSession(sessionId: string): Promise<CartWithItems | undefined> {
    let cart = await cartsRepository.findBySessionId(sessionId);
    if (!cart) {
      cart = await cartsRepository.create({ sessionId });
    }
    return cartsRepository.findByIdWithItems(cart.id);
  },
  async getCartForUser(userId: string): Promise<CartWithItems | undefined> {
    let cart = await cartsRepository.findByUserId(userId);
    if (!cart) {
      cart = await cartsRepository.create({ userId });
    }
    return cartsRepository.findByIdWithItems(cart.id);
  },

  async mergeOnLogin(userId: string, sessionId: string): Promise<void> {
    const guestCart = await cartsRepository.findBySessionId(sessionId);
    if (!guestCart) return;

    let userCart = await cartsRepository.findByUserId(userId);
    if (!userCart) {
      userCart = await cartsRepository.create({ userId });
    }

    await cartsRepository.mergeCarts(guestCart.id, userCart.id);
  },

  async removeItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepository.findByUserId(userId);
    } else if (sessionId) {
      cart = await cartsRepository.findBySessionId(sessionId);
    }

    if (!cart) throw new Error("Cart not found");

    await cartsRepository.removeItem(cart.id, productId);
  },

  async updateItemQuantity(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepository.findByUserId(userId);
    } else if (sessionId) {
      cart = await cartsRepository.findBySessionId(sessionId);
    }

    if (!cart) throw new Error("Cart not found");

    await cartsRepository.updateItemQuantity(cart.id, productId, quantity);
  },

  async clearCart(userId: string): Promise<void> {
    const cart = await cartsRepository.findByUserId(userId);
    if (cart) {
      await cartsRepository.clearCart(cart.id);
    }
  },

  async clearCartBySession(sessionId: string): Promise<void> {
    const cart = await cartsRepository.findBySessionId(sessionId);
    if (cart) {
      await cartsRepository.clearCart(cart.id);
    }
  },
};
