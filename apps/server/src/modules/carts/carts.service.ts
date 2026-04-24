import { productsRepository } from "../products/products.repository";
import type { CartWithItems } from "./carts.repository";
import { cartsRepository } from "./carts.repository";

export const cartsService = {
  async getMyCart(userId: string): Promise<CartWithItems> {
    await cartsRepository.upsertCart(userId);
    const cart = await cartsRepository.findByUserId(userId);
    if (!cart) throw new Error("Unexpected: cart not found after upsert");
    return cart;
  },

  async addItem(userId: string, productId: string, quantity: number): Promise<CartWithItems> {
    const product = await productsRepository.findById(productId);
    if (!product) throw new Error("NOT_FOUND");

    const cart = await cartsRepository.upsertCart(userId);
    await cartsRepository.addItem(cart.id, productId, quantity);

    const full = await cartsRepository.findByUserId(userId);
    if (!full) throw new Error("Unexpected: cart not found after add");
    return full;
  },

  async updateItem(userId: string, cartItemId: string, quantity: number): Promise<CartWithItems> {
    const cart = await cartsRepository.upsertCart(userId);
    const item = await cartsRepository.findItem(cartItemId);
    if (!item || item.cartId !== cart.id) throw new Error("NOT_FOUND");

    await cartsRepository.updateItem(cartItemId, quantity);

    const full = await cartsRepository.findByUserId(userId);
    if (!full) throw new Error("Unexpected: cart not found after update");
    return full;
  },

  async removeItem(userId: string, cartItemId: string): Promise<void> {
    const cart = await cartsRepository.upsertCart(userId);
    const item = await cartsRepository.findItem(cartItemId);
    if (!item || item.cartId !== cart.id) throw new Error("NOT_FOUND");

    await cartsRepository.removeItem(cartItemId);
  },

  async mergeGuestItems(
    userId: string,
    items: { productId: string; quantity: number }[]
  ): Promise<CartWithItems> {
    const cart = await cartsRepository.upsertCart(userId);
    await cartsRepository.mergeGuestItems(cart.id, items);

    const full = await cartsRepository.findByUserId(userId);
    if (!full) throw new Error("Unexpected: cart not found after merge");
    return full;
  },
};
