import type { Cart } from "@repo/shared/schemas";
import { type IProductsRepository, productsRepository } from "../products/products.repository";
import { type CartWithItems, cartsRepository, type ICartsRepository } from "./carts.repository";

export class CartsService {
  constructor(
    private cartsRepo: ICartsRepository,
    private productsRepo: IProductsRepository
  ) {}

  async addItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    // Check if product is deleted
    const isDeleted = await this.productsRepo.isDeleted(productId);
    if (isDeleted) throw new Error("PRODUCT_DELETED");

    let cart: Cart | undefined;
    if (userId) {
      cart = await this.cartsRepo.findByUserId(userId);
      if (!cart) cart = await this.cartsRepo.create({ userId });
    } else if (sessionId) {
      cart = await this.cartsRepo.findBySessionId(sessionId);
      if (!cart) cart = await this.cartsRepo.create({ sessionId });
    }

    if (!cart) throw new Error("Could not find or create cart");

    await this.cartsRepo.addItem(cart.id, productId, quantity);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartsRepo.findByUserId(userId);
    if (cart) {
      await this.cartsRepo.clearCart(cart.id);
    }
  }

  async clearCartBySession(sessionId: string): Promise<void> {
    const cart = await this.cartsRepo.findBySessionId(sessionId);
    if (cart) {
      await this.cartsRepo.clearCart(cart.id);
    }
  }

  async getCartForSession(sessionId: string): Promise<CartWithItems | undefined> {
    let cart = await this.cartsRepo.findBySessionId(sessionId);
    if (!cart) {
      cart = await this.cartsRepo.create({ sessionId });
    }
    return this.cartsRepo.findByIdWithItems(cart.id);
  }

  async getCartForUser(userId: string): Promise<CartWithItems | undefined> {
    let cart = await this.cartsRepo.findByUserId(userId);
    if (!cart) {
      cart = await this.cartsRepo.create({ userId });
    }
    return this.cartsRepo.findByIdWithItems(cart.id);
  }

  async mergeOnLogin(userId: string, sessionId: string): Promise<void> {
    const guestCart = await this.cartsRepo.findBySessionId(sessionId);
    if (!guestCart) return;

    let userCart = await this.cartsRepo.findByUserId(userId);
    if (!userCart) {
      userCart = await this.cartsRepo.create({ userId });
    }

    await this.cartsRepo.mergeCarts(guestCart.id, userCart.id);
  }

  async removeItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
      cart = await this.cartsRepo.findByUserId(userId);
    } else if (sessionId) {
      cart = await this.cartsRepo.findBySessionId(sessionId);
    }

    if (!cart) throw new Error("Cart not found");

    await this.cartsRepo.removeItem(cart.id, productId);
  }

  async updateItemQuantity(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
      cart = await this.cartsRepo.findByUserId(userId);
    } else if (sessionId) {
      cart = await this.cartsRepo.findBySessionId(sessionId);
    }

    if (!cart) throw new Error("Cart not found");

    await this.cartsRepo.updateItemQuantity(cart.id, productId, quantity);
  }
}

export const cartsService = new CartsService(cartsRepository, productsRepository);
