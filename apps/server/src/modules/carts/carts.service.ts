import type { Cart } from "@repo/shared/schemas";
<<<<<<< HEAD
import { db } from "../../db";
import { InsufficientStockError, ProductNotFoundError } from "../products/products.errors";
import * as productsRepo from "../products/products.repository";
import { CartNotFoundError } from "./carts.errors";
import type { CartWithItems } from "./carts.repository";
import * as cartsRepo from "./carts.repository";

export class CartsService {
=======
import { type IProductsRepository, productsRepository } from "../products/products.repository";
import { type CartWithItems, cartsRepository, type ICartsRepository } from "./carts.repository";

export class CartsService {
  constructor(
    private cartsRepo: ICartsRepository,
    private productsRepo: IProductsRepository
  ) {}

>>>>>>> origin/main
  async addItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
<<<<<<< HEAD
    const product = await productsRepo.findById(db, productId);
    if (!product) throw new ProductNotFoundError(productId);
    if (product.quantity < quantity) throw new InsufficientStockError(product.name);

    let cart: Cart | undefined;
    if (userId) {
      cart = await cartsRepo.findByUserId(db, userId);
      if (!cart) cart = await cartsRepo.create(db, { userId });
    } else if (sessionId) {
      cart = await cartsRepo.findBySessionId(db, sessionId);
      if (!cart) cart = await cartsRepo.create(db, { sessionId });
    }

    if (!cart) throw new CartNotFoundError();

    await cartsRepo.addItem(db, cart.id, productId, quantity);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await cartsRepo.findByUserId(db, userId);
    if (cart) {
      await cartsRepo.clearCart(db, cart.id);
=======
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
>>>>>>> origin/main
    }
  }

  async clearCartBySession(sessionId: string): Promise<void> {
<<<<<<< HEAD
    const cart = await cartsRepo.findBySessionId(db, sessionId);
    if (cart) {
      await cartsRepo.clearCart(db, cart.id);
=======
    const cart = await this.cartsRepo.findBySessionId(sessionId);
    if (cart) {
      await this.cartsRepo.clearCart(cart.id);
>>>>>>> origin/main
    }
  }

  async getCartForSession(sessionId: string): Promise<CartWithItems | undefined> {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
  }

  async removeItem(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
<<<<<<< HEAD
      cart = await cartsRepo.findByUserId(db, userId);
    } else if (sessionId) {
      cart = await cartsRepo.findBySessionId(db, sessionId);
    }

    if (!cart) throw new CartNotFoundError();

    await cartsRepo.removeItem(db, cart.id, productId);
=======
      cart = await this.cartsRepo.findByUserId(userId);
    } else if (sessionId) {
      cart = await this.cartsRepo.findBySessionId(sessionId);
    }

    if (!cart) throw new Error("Cart not found");

    await this.cartsRepo.removeItem(cart.id, productId);
>>>>>>> origin/main
  }

  async updateItemQuantity(
    { userId, sessionId }: { userId?: string; sessionId?: string },
    productId: string,
    quantity: number
  ): Promise<void> {
    let cart: Cart | undefined;
    if (userId) {
<<<<<<< HEAD
      cart = await cartsRepo.findByUserId(db, userId);
    } else if (sessionId) {
      cart = await cartsRepo.findBySessionId(db, sessionId);
    }

    if (!cart) throw new CartNotFoundError();

    if (quantity <= 0) {
      await cartsRepo.removeItem(db, cart.id, productId);
    } else {
      await cartsRepo.setItemQuantity(db, cart.id, productId, quantity);
    }
  }
}

export const cartsService = new CartsService();
=======
      cart = await this.cartsRepo.findByUserId(userId);
    } else if (sessionId) {
      cart = await this.cartsRepo.findBySessionId(sessionId);
    }

    if (!cart) throw new Error("Cart not found");

    await this.cartsRepo.updateItemQuantity(cart.id, productId, quantity);
  }
}

export const cartsService = new CartsService(cartsRepository, productsRepository);
>>>>>>> origin/main
