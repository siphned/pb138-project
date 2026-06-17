import type { Cart, Product } from "@repo/shared/schemas";
import { cartItems, carts } from "@repo/shared/schemas";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Database } from "../../db";

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
