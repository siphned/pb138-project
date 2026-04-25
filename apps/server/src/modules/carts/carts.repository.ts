import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import type { Cart, Product } from "../../db/schema";
import { cartItems, carts } from "../../db/schema";

export type CartItemWithProduct = typeof cartItems.$inferSelect & {
  product: Product;
};

export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
};

export const cartsRepository = {
  findByUserId(userId: string): Promise<Cart | undefined> {
    return db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });
  },

  findBySessionId(sessionId: string): Promise<Cart | undefined> {
    return db.query.carts.findFirst({
      where: eq(carts.sessionId, sessionId),
    });
  },

  findByIdWithItems(id: string): Promise<CartWithItems | undefined> {
    return db.query.carts.findFirst({
      where: eq(carts.id, id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    }) as Promise<CartWithItems | undefined>;
  },

  async create(data: { userId?: string; sessionId?: string }): Promise<Cart> {
    const [cart] = await db.insert(carts).values(data).returning();
    if (!cart) throw new Error("Failed to create cart");
    return cart;
  },

  async addItem(cartId: string, productId: string, quantity: number): Promise<void> {
    await db
      .insert(cartItems)
      .values({ cartId, productId, quantity })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.productId],
        set: { quantity: sql`${cartItems.quantity} + ${quantity}`, updatedAt: new Date() },
      });
  },

  async updateItemQuantity(cartId: string, productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
    } else {
      await db
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
    }
  },

  async removeItem(cartId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
  },

  async clear(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  },

  async mergeCarts(fromCartId: string, toCartId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const fromItems = await tx.select().from(cartItems).where(eq(cartItems.cartId, fromCartId));

      for (const item of fromItems) {
        await tx
          .insert(cartItems)
          .values({ cartId: toCartId, productId: item.productId, quantity: item.quantity })
          .onConflictDoUpdate({
            target: [cartItems.cartId, cartItems.productId],
            set: { quantity: sql`${cartItems.quantity} + ${item.quantity}`, updatedAt: new Date() },
          });
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, fromCartId));
      await tx.delete(carts).where(eq(carts.id, fromCartId));
    });
  },
};
