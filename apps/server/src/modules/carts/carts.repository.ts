import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import type { Cart, CartItem, Product } from "../../db/schema";
import { cartItems, carts } from "../../db/schema";

export type CartItemWithProduct = CartItem & {
  product: Pick<Product, "id" | "name" | "price" | "shopId" | "quantity">;
};

export type CartWithItems = Cart & { items: CartItemWithProduct[] };

export const cartsRepository = {
  findByUserId(userId: string): Promise<CartWithItems | undefined> {
    return db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      with: {
        items: {
          with: {
            product: {
              columns: { id: true, name: true, price: true, shopId: true, quantity: true },
            },
          },
        },
      },
    }) as Promise<CartWithItems | undefined>;
  },

  async upsertCart(userId: string): Promise<Cart> {
    const [inserted] = await db.insert(carts).values({ userId }).onConflictDoNothing().returning();
    if (inserted) return inserted;
    const existing = await db.query.carts.findFirst({ where: eq(carts.userId, userId) });
    if (!existing) throw new Error("Failed to get or create cart");
    return existing;
  },

  findItem(cartItemId: string): Promise<CartItem | undefined> {
    return db.query.cartItems.findFirst({
      where: eq(cartItems.id, cartItemId),
    });
  },

  async addItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
    });

    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existing.id))
        .returning();
      if (!updated) throw new Error("CartItem update returned no rows");
      return updated;
    }

    const [created] = await db
      .insert(cartItems)
      .values({ cartId, productId, quantity })
      .returning();
    if (!created) throw new Error("CartItem insert returned no rows");
    return created;
  },

  async updateItem(cartItemId: string, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, cartItemId))
      .returning();
    if (!updated) throw new Error("CartItem not found");
    return updated;
  },

  async removeItem(cartItemId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  },

  async clearCart(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  },

  async mergeGuestItems(
    cartId: string,
    items: { productId: string; quantity: number }[]
  ): Promise<void> {
    const existing = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cartId),
      columns: { productId: true },
    });
    const existingProductIds = new Set(existing.map((i) => i.productId));

    const toInsert = items.filter((i) => !existingProductIds.has(i.productId));
    if (toInsert.length === 0) return;

    await db
      .insert(cartItems)
      .values(toInsert.map((i) => ({ cartId, productId: i.productId, quantity: i.quantity })));
  },
};
