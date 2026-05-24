import type { Cart, Product } from "@repo/shared/schemas";
import { cartItems, carts } from "@repo/shared/schemas";
import { and, eq, isNull, sql } from "drizzle-orm";
<<<<<<< HEAD
import type { Database } from "../../db";
=======
import { db } from "../../db";
>>>>>>> origin/main

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  product: Product;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

<<<<<<< HEAD
export async function addItem(
  db: Database,
  cartId: string,
  productId: string,
  quantity: number
): Promise<void> {
  await db
    .insert(cartItems)
    .values({ cartId, productId, quantity })
    .onConflictDoUpdate({
      set: { quantity: sql`${cartItems.quantity} + ${quantity}`, updatedAt: new Date() },
      target: [cartItems.cartId, cartItems.productId],
    });
}

export async function clearCart(db: Database, cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function create(
  db: Database,
  data: { userId?: string; sessionId?: string }
): Promise<Cart> {
  const [cart] = await db.insert(carts).values(data).returning();
  if (!cart) throw new Error("Failed to create cart");
  return cart;
}

export async function findByIdWithItems(
  db: Database,
  id: string
): Promise<CartWithItems | undefined> {
  const cart = await db.query.carts.findFirst({
    where: and(eq(carts.id, id), isNull(carts.deletedAt)),
    with: {
      items: {
        where: (items, { isNull }) => isNull(items.deletedAt),
        with: {
          product: true,
        },
      },
    },
  });

  if (cart) {
    const typedCart = cart as CartWithItems;
    if (typedCart.items) {
      typedCart.items = typedCart.items.filter((item) => item.product && !item.product.deletedAt);
    }
    return typedCart;
  }

  return undefined;
}

export async function findBySessionId(db: Database, sessionId: string): Promise<Cart | undefined> {
  return db.query.carts.findFirst({
    where: and(eq(carts.sessionId, sessionId), isNull(carts.deletedAt)),
  });
}

export async function findByUserId(db: Database, userId: string): Promise<Cart | undefined> {
  return db.query.carts.findFirst({
    where: and(eq(carts.userId, userId), isNull(carts.deletedAt)),
  });
}

export async function removeItem(db: Database, cartId: string, productId: string): Promise<void> {
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
}

export async function setItemQuantity(
  db: Database,
  cartId: string,
  productId: string,
  quantity: number
): Promise<void> {
  await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
}

export async function getCartItems(db: Database, cartId: string) {
  return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function deleteCart(db: Database, cartId: string) {
  await db.update(carts).set({ deletedAt: new Date() }).where(eq(carts.id, cartId));
}
=======
export interface ICartsRepository {
  addItem(cartId: string, productId: string, quantity: number): Promise<void>;
  clear(cartId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  create(data: { userId?: string; sessionId?: string }): Promise<Cart>;
  findByIdWithItems(id: string): Promise<CartWithItems | undefined>;
  findBySessionId(sessionId: string): Promise<Cart | undefined>;
  findByUserId(userId: string): Promise<Cart | undefined>;
  mergeCarts(fromCartId: string, toCartId: string): Promise<void>;
  removeItem(cartId: string, productId: string): Promise<void>;
  updateItemQuantity(cartId: string, productId: string, quantity: number): Promise<void>;
}

export const cartsRepository: ICartsRepository = {
  async addItem(cartId: string, productId: string, quantity: number): Promise<void> {
    await db
      .insert(cartItems)
      .values({ cartId, productId, quantity })
      .onConflictDoUpdate({
        set: { quantity: sql`${cartItems.quantity} + ${quantity}`, updatedAt: new Date() },
        target: [cartItems.cartId, cartItems.productId],
      });
  },

  async clear(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  },

  async clearCart(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  },

  async create(data: { userId?: string; sessionId?: string }): Promise<Cart> {
    const [cart] = await db.insert(carts).values(data).returning();
    if (!cart) throw new Error("Failed to create cart");
    return cart;
  },

  async findByIdWithItems(id: string): Promise<CartWithItems | undefined> {
    const cart = await db.query.carts.findFirst({
      where: and(eq(carts.id, id), isNull(carts.deletedAt)),
      with: {
        items: {
          where: (items, { isNull }) => isNull(items.deletedAt),
          with: {
            product: true,
          },
        },
      },
    });

    if (cart) {
      const typedCart = cart as unknown as CartWithItems;
      if (typedCart.items) {
        typedCart.items = typedCart.items.filter((item) => item.product && !item.product.deletedAt);
      }
      return typedCart;
    }

    return undefined;
  },

  findBySessionId(sessionId: string): Promise<Cart | undefined> {
    return db.query.carts.findFirst({
      where: and(eq(carts.sessionId, sessionId), isNull(carts.deletedAt)),
    });
  },
  findByUserId(userId: string): Promise<Cart | undefined> {
    return db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), isNull(carts.deletedAt)),
    });
  },

  async mergeCarts(fromCartId: string, toCartId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const fromItems = await tx.select().from(cartItems).where(eq(cartItems.cartId, fromCartId));

      for (const item of fromItems) {
        await tx
          .insert(cartItems)
          .values({ cartId: toCartId, productId: item.productId, quantity: item.quantity })
          .onConflictDoUpdate({
            set: { quantity: sql`${cartItems.quantity} + ${item.quantity}`, updatedAt: new Date() },
            target: [cartItems.cartId, cartItems.productId],
          });
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, fromCartId));
      await tx.update(carts).set({ deletedAt: new Date() }).where(eq(carts.id, fromCartId));
    });
  },

  async removeItem(cartId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
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
};
>>>>>>> origin/main
