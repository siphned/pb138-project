# Cart & Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full shopping cart and order lifecycle — cart CRUD, guest-cart merge, multi-vendor checkout, and shop-owner order-item status updates.

**Architecture:** Two independent Elysia modules (`carts/`, `orders/`) following the existing routes→service→repository→schema layering. One DB migration adds `status` to `order_items`. The checkout service reads cart data via `cartsRepository`, creates the order in a single transaction that also clears the cart.

**Tech Stack:** Elysia, Drizzle ORM, PostgreSQL, Vitest, Zod (`t` from elysia), Clerk auth macros (`requireAuth`, `requireCapability`).

---

## File Map

**Create:**
- `apps/server/src/modules/carts/carts.schema.ts`
- `apps/server/src/modules/carts/carts.repository.ts`
- `apps/server/src/modules/carts/carts.service.ts`
- `apps/server/src/modules/carts/carts.routes.ts`
- `apps/server/src/modules/carts/index.ts`
- `apps/server/src/modules/orders/orders.schema.ts`
- `apps/server/src/modules/orders/orders.repository.ts`
- `apps/server/src/modules/orders/orders.service.ts`
- `apps/server/src/modules/orders/orders.routes.ts`
- `apps/server/src/modules/orders/index.ts`
- `apps/server/src/__tests__/carts.test.ts`
- `apps/server/src/__tests__/orders.test.ts`

**Modify:**
- `apps/server/src/db/schema/orders.ts` — add `status` column to `orderItems`
- `apps/server/src/db/schema/index.ts` — export `CartItem`, `OrderItem`, `NewOrder`, `NewOrderItem` types
- `apps/server/src/app.ts` — register `cartsRoutes` and `ordersRoutes`

---

## Task 1: DB Schema — Add status to orderItems

**Files:**
- Modify: `apps/server/src/db/schema/orders.ts`
- Modify: `apps/server/src/db/schema/index.ts`

- [ ] **Step 1: Add status column to orderItems in Drizzle schema**

  Open `apps/server/src/db/schema/orders.ts`. The full file should look like this after the change (add the `status` line and the `orderStatusEnum` import):

  ```typescript
  import { numeric, pgTable, smallint, timestamp, uuid } from "drizzle-orm/pg-core";
  import { addresses } from "./addresses";
  import { products } from "./catalog";
  import {
    deliveryTypeEnum,
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
  } from "./enums";
  import { shops } from "./sellers";
  import { users } from "./users";

  export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
    status: orderStatusEnum("status").notNull(),
    deliveryType: deliveryTypeEnum("delivery_type").notNull(),
    shippingAddressId: uuid("shipping_address_id")
      .notNull()
      .references(() => addresses.id),
    billingAddressId: uuid("billing_address_id")
      .notNull()
      .references(() => addresses.id),
  });

  export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: smallint("quantity").notNull(),
    unitPriceAtPurchase: numeric("unit_price_at_purchase", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
  });
  ```

- [ ] **Step 2: Export CartItem, OrderItem, NewOrder, NewOrderItem types**

  Open `apps/server/src/db/schema/index.ts`. Add the following imports and type exports. Insert the new imports alongside the existing `import type` block and the new exports alongside the existing `export type` lines:

  ```typescript
  // Add to imports block:
  import type { cartItems } from "./carts";
  import type { orderItems } from "./orders";

  // Add to exports block:
  export type CartItem = (typeof cartItems)["$inferSelect"];
  export type NewCartItem = (typeof cartItems)["$inferInsert"];
  export type OrderItem = (typeof orderItems)["$inferSelect"];
  export type NewOrderItem = (typeof orderItems)["$inferInsert"];
  export type NewOrder = (typeof orders)["$inferInsert"];
  ```

- [ ] **Step 3: Generate and apply the migration**

  ```bash
  cd apps/server && bun run db:generate
  ```

  Expected: Drizzle prints a new migration file name like `0005_add_order_item_status.sql` (number may differ).

  ```bash
  bun run db:migrate
  ```

  Expected: "Applying migration..." with no errors.

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  cd ../.. && bun run type-check
  ```

  Expected: all packages pass type check.

- [ ] **Step 5: Commit**

  ```bash
  git add apps/server/src/db/schema/orders.ts apps/server/src/db/schema/index.ts apps/server/src/db/migrations/
  git commit -m "feat(WINE-65): add status column to order_items and export inferred types"
  ```

---

## Task 2: Cart Schema and Repository

**Files:**
- Create: `apps/server/src/modules/carts/carts.schema.ts`
- Create: `apps/server/src/modules/carts/carts.repository.ts`

- [ ] **Step 1: Create carts.schema.ts**

  Create `apps/server/src/modules/carts/carts.schema.ts`:

  ```typescript
  import { t } from "elysia";

  export const addItemBody = t.Object({
    productId: t.String({ format: "uuid" }),
    quantity: t.Integer({ minimum: 1 }),
  });

  export const updateItemBody = t.Object({
    quantity: t.Integer({ minimum: 1 }),
  });

  export const mergeBody = t.Object({
    items: t.Array(
      t.Object({
        productId: t.String({ format: "uuid" }),
        quantity: t.Integer({ minimum: 1 }),
      }),
      { minItems: 1 }
    ),
  });
  ```

- [ ] **Step 2: Create carts.repository.ts**

  Create `apps/server/src/modules/carts/carts.repository.ts`:

  ```typescript
  import { and, eq } from "drizzle-orm";
  import { db } from "../../db";
  import type { Cart, CartItem, Product } from "../../db/schema";
  import { cartItems, carts } from "../../db/schema";

  export type CartItemWithProduct = CartItem & {
    product: Pick<Product, "id" | "name" | "price" | "shopId">;
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
                columns: { id: true, name: true, price: true, shopId: true },
              },
            },
          },
        },
      }) as Promise<CartWithItems | undefined>;
    },

    async upsertCart(userId: string): Promise<Cart> {
      const existing = await db.query.carts.findFirst({
        where: eq(carts.userId, userId),
      });
      if (existing) return existing;

      const [created] = await db.insert(carts).values({ userId }).returning();
      if (!created) throw new Error("Cart insert returned no rows");
      return created;
    },

    findItem(cartItemId: string): Promise<CartItem | undefined> {
      return db.query.cartItems.findFirst({
        where: eq(cartItems.id, cartItemId),
      });
    },

    async addItem(
      cartId: string,
      productId: string,
      quantity: number
    ): Promise<CartItem> {
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
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  bun run type-check
  ```

  Expected: passes with no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add apps/server/src/modules/carts/carts.schema.ts apps/server/src/modules/carts/carts.repository.ts
  git commit -m "feat(WINE-65): add carts schema and repository"
  ```

---

## Task 3: Cart Service

**Files:**
- Create: `apps/server/src/modules/carts/carts.service.ts`

- [ ] **Step 1: Create carts.service.ts**

  Create `apps/server/src/modules/carts/carts.service.ts`:

  ```typescript
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

    async updateItem(
      userId: string,
      cartItemId: string,
      quantity: number
    ): Promise<CartWithItems> {
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
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  bun run type-check
  ```

  Expected: passes with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/server/src/modules/carts/carts.service.ts
  git commit -m "feat(WINE-65): add carts service"
  ```

---

## Task 4: Cart Routes and Registration

**Files:**
- Create: `apps/server/src/modules/carts/carts.routes.ts`
- Create: `apps/server/src/modules/carts/index.ts`
- Modify: `apps/server/src/app.ts`

- [ ] **Step 1: Create carts.routes.ts**

  Create `apps/server/src/modules/carts/carts.routes.ts`:

  ```typescript
  import { Elysia, status, t } from "elysia";
  import { authPlugin } from "../auth";
  import { addItemBody, mergeBody, updateItemBody } from "./carts.schema";
  import { cartsService } from "./carts.service";

  function handleError(e: unknown) {
    if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "Not found");
    throw e;
  }

  export const cartsRoutes = new Elysia()
    .use(authPlugin)

    .get(
      "/carts/me",
      async ({ dbUser }) => cartsService.getMyCart(dbUser.id),
      {
        requireAuth: true,
        detail: {
          tags: ["carts"],
          summary: "Get current user's cart",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .post(
      "/carts/items",
      async ({ dbUser, body }) => {
        try {
          return status(201, await cartsService.addItem(dbUser.id, body.productId, body.quantity));
        } catch (e) {
          return handleError(e);
        }
      },
      {
        requireAuth: true,
        body: addItemBody,
        detail: {
          tags: ["carts"],
          summary: "Add item to cart",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .put(
      "/carts/items/:id",
      async ({ dbUser, params, body }) => {
        try {
          return await cartsService.updateItem(dbUser.id, params.id, body.quantity);
        } catch (e) {
          return handleError(e);
        }
      },
      {
        requireAuth: true,
        params: t.Object({ id: t.String() }),
        body: updateItemBody,
        detail: {
          tags: ["carts"],
          summary: "Update cart item quantity",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .delete(
      "/carts/items/:id",
      async ({ dbUser, params }) => {
        try {
          await cartsService.removeItem(dbUser.id, params.id);
          return status(204, null);
        } catch (e) {
          return handleError(e);
        }
      },
      {
        requireAuth: true,
        params: t.Object({ id: t.String() }),
        detail: {
          tags: ["carts"],
          summary: "Remove item from cart",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .post(
      "/carts/merge",
      async ({ dbUser, body }) => cartsService.mergeGuestItems(dbUser.id, body.items),
      {
        requireAuth: true,
        body: mergeBody,
        detail: {
          tags: ["carts"],
          summary: "Merge guest cart items into user cart (DB wins on conflict)",
          security: [{ bearerAuth: [] }],
        },
      }
    );
  ```

- [ ] **Step 2: Create index.ts**

  Create `apps/server/src/modules/carts/index.ts`:

  ```typescript
  export { cartsRoutes } from "./carts.routes";
  ```

- [ ] **Step 3: Register cartsRoutes in app.ts**

  Open `apps/server/src/app.ts`. Add the import and `.use(cartsRoutes)`:

  ```typescript
  import { cartsRoutes } from "./modules/carts";
  ```

  Add `.use(cartsRoutes)` after `.use(winemakersRoutes)`:

  ```typescript
  .use(winemakersRoutes)
  .use(cartsRoutes);
  ```

- [ ] **Step 4: Verify TypeScript compiles and type-check passes**

  ```bash
  bun run type-check
  ```

  Expected: passes with no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add apps/server/src/modules/carts/ apps/server/src/app.ts
  git commit -m "feat(WINE-65): add carts routes and register module"
  ```

---

## Task 5: Cart Tests

**Files:**
- Create: `apps/server/src/__tests__/carts.test.ts`

- [ ] **Step 1: Write the test file**

  Create `apps/server/src/__tests__/carts.test.ts`:

  ```typescript
  import { beforeEach, describe, expect, it, vi } from "vitest";

  vi.mock("../modules/carts/carts.repository", () => ({
    cartsRepository: {
      findByUserId: vi.fn(),
      upsertCart: vi.fn(),
      findItem: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      mergeGuestItems: vi.fn(),
    },
  }));

  vi.mock("../modules/products/products.repository", () => ({
    productsRepository: {
      findById: vi.fn(),
    },
  }));

  import { cartsRepository } from "../modules/carts/carts.repository";
  import { cartsService } from "../modules/carts/carts.service";
  import { productsRepository } from "../modules/products/products.repository";

  const mockCartBase = {
    id: "cart-1",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockCartEmpty = { ...mockCartBase, items: [] };
  const mockProduct = {
    id: "prod-1",
    shopId: "shop-1",
    name: "Red Wine",
    price: "25.00",
    isBundle: false,
    quantity: 10,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    productWines: [],
  };
  const mockCartItem = {
    id: "item-1",
    cartId: "cart-1",
    productId: "prod-1",
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("cartsService.getMyCart", () => {
    beforeEach(() => vi.clearAllMocks());

    it("upserts the cart and returns it with items", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

      const result = await cartsService.getMyCart("user-1");

      expect(cartsRepository.upsertCart).toHaveBeenCalledWith("user-1");
      expect(cartsRepository.findByUserId).toHaveBeenCalledWith("user-1");
      expect(result.items).toHaveLength(0);
    });
  });

  describe("cartsService.addItem", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws NOT_FOUND when product does not exist", async () => {
      vi.mocked(productsRepository.findById).mockResolvedValue(undefined);

      await expect(cartsService.addItem("user-1", "bad-id", 1)).rejects.toThrow("NOT_FOUND");
      expect(cartsRepository.addItem).not.toHaveBeenCalled();
    });

    it("adds item and returns updated cart when product exists", async () => {
      vi.mocked(productsRepository.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.addItem).mockResolvedValue(mockCartItem);
      const cartWithItem = {
        ...mockCartEmpty,
        items: [{ ...mockCartItem, product: mockProduct }],
      };
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(cartWithItem as any);

      const result = await cartsService.addItem("user-1", "prod-1", 2);

      expect(cartsRepository.addItem).toHaveBeenCalledWith("cart-1", "prod-1", 2);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.quantity).toBe(2);
    });
  });

  describe("cartsService.updateItem", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws NOT_FOUND when item belongs to a different cart", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.findItem).mockResolvedValue({
        ...mockCartItem,
        cartId: "cart-other",
      });

      await expect(cartsService.updateItem("user-1", "item-1", 3)).rejects.toThrow("NOT_FOUND");
      expect(cartsRepository.updateItem).not.toHaveBeenCalled();
    });

    it("throws NOT_FOUND when item does not exist", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.findItem).mockResolvedValue(undefined);

      await expect(cartsService.updateItem("user-1", "item-1", 3)).rejects.toThrow("NOT_FOUND");
    });

    it("updates quantity when item belongs to user cart", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.findItem).mockResolvedValue(mockCartItem);
      vi.mocked(cartsRepository.updateItem).mockResolvedValue({ ...mockCartItem, quantity: 3 });
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

      await cartsService.updateItem("user-1", "item-1", 3);

      expect(cartsRepository.updateItem).toHaveBeenCalledWith("item-1", 3);
    });
  });

  describe("cartsService.removeItem", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws NOT_FOUND when item belongs to a different cart", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.findItem).mockResolvedValue({
        ...mockCartItem,
        cartId: "cart-other",
      });

      await expect(cartsService.removeItem("user-1", "item-1")).rejects.toThrow("NOT_FOUND");
      expect(cartsRepository.removeItem).not.toHaveBeenCalled();
    });

    it("removes item when it belongs to user cart", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.findItem).mockResolvedValue(mockCartItem);
      vi.mocked(cartsRepository.removeItem).mockResolvedValue(undefined);

      await cartsService.removeItem("user-1", "item-1");

      expect(cartsRepository.removeItem).toHaveBeenCalledWith("item-1");
    });
  });

  describe("cartsService.mergeGuestItems", () => {
    beforeEach(() => vi.clearAllMocks());

    it("delegates to repository with correct cartId and guest items", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.mergeGuestItems).mockResolvedValue(undefined);
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

      const guestItems = [{ productId: "prod-2", quantity: 1 }];
      await cartsService.mergeGuestItems("user-1", guestItems);

      expect(cartsRepository.mergeGuestItems).toHaveBeenCalledWith("cart-1", guestItems);
    });

    it("returns the cart after merge", async () => {
      vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
      vi.mocked(cartsRepository.mergeGuestItems).mockResolvedValue(undefined);
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

      const result = await cartsService.mergeGuestItems("user-1", []);

      expect(result.id).toBe("cart-1");
    });
  });
  ```

- [ ] **Step 2: Run the cart tests**

  ```bash
  bun run test
  ```

  Expected: all 9 cart tests pass. If any fail, fix the service or test before continuing.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/server/src/__tests__/carts.test.ts
  git commit -m "test(WINE-65): add cart service unit tests"
  ```

---

## Task 6: Orders Schema and Repository

**Files:**
- Create: `apps/server/src/modules/orders/orders.schema.ts`
- Create: `apps/server/src/modules/orders/orders.repository.ts`

- [ ] **Step 1: Create orders.schema.ts**

  Create `apps/server/src/modules/orders/orders.schema.ts`:

  ```typescript
  import { t } from "elysia";

  const addressInput = t.Object({
    country: t.String({ minLength: 1 }),
    city: t.String({ minLength: 1 }),
    street: t.String({ minLength: 1 }),
    postalCode: t.String({ minLength: 1 }),
    houseNumber: t.String({ minLength: 1 }),
  });

  export const checkoutBody = t.Object({
    paymentMethod: t.Union([
      t.Literal("card"),
      t.Literal("bank_transfer"),
      t.Literal("cash_on_delivery"),
    ]),
    deliveryType: t.Union([t.Literal("pickup"), t.Literal("shipping")]),
    shippingAddressId: t.Optional(t.String({ format: "uuid" })),
    newShippingAddress: t.Optional(addressInput),
    billingAddressId: t.Optional(t.String({ format: "uuid" })),
    newBillingAddress: t.Optional(addressInput),
  });

  export const updateItemStatusBody = t.Object({
    status: t.Union([
      t.Literal("confirmed"),
      t.Literal("shipped"),
      t.Literal("delivered"),
      t.Literal("cancelled"),
    ]),
  });
  ```

- [ ] **Step 2: Create orders.repository.ts**

  Create `apps/server/src/modules/orders/orders.repository.ts`:

  ```typescript
  import { eq } from "drizzle-orm";
  import { db } from "../../db";
  import type { Address, Order, OrderItem, Product } from "../../db/schema";
  import { addresses, cartItems as cartItemsTable, orderItems, orders } from "../../db/schema";

  export type OrderItemWithProduct = OrderItem & {
    product: Pick<Product, "id" | "name">;
  };

  export type OrderWithItems = Order & { items: OrderItemWithProduct[] };

  type AddressInput = {
    country: string;
    city: string;
    street: string;
    postalCode: string;
    houseNumber: string;
  };

  type CreateOrderData = {
    userId: string;
    shippingAddressId: string;
    billingAddressId: string;
    paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
    deliveryType: "pickup" | "shipping";
    totalPrice: string;
  };

  type CreateOrderItemData = {
    shopId: string;
    productId: string;
    quantity: number;
    unitPriceAtPurchase: string;
  };

  export const ordersRepository = {
    async insertAddress(data: AddressInput): Promise<Address> {
      const [address] = await db.insert(addresses).values(data).returning();
      if (!address) throw new Error("Address insert returned no rows");
      return address;
    },

    async createOrderWithItems(
      orderData: CreateOrderData,
      itemsData: CreateOrderItemData[],
      cartId: string
    ): Promise<Order> {
      return db.transaction(async (tx) => {
        const [order] = await tx
          .insert(orders)
          .values({
            ...orderData,
            status: "pending",
            paymentStatus: "pending",
            shippingFee: "0",
            discount: "0",
          })
          .returning();
        if (!order) throw new Error("Order insert returned no rows");

        await tx.insert(orderItems).values(
          itemsData.map((i) => ({
            ...i,
            orderId: order.id,
            status: "pending" as const,
          }))
        );

        await tx.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));

        return order;
      });
    },

    findOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
      return db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
          items: {
            with: {
              product: { columns: { id: true, name: true } },
            },
          },
        },
      }) as Promise<OrderWithItems[]>;
    },

    findOrderById(orderId: string): Promise<OrderWithItems | undefined> {
      return db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
          items: {
            with: {
              product: { columns: { id: true, name: true } },
            },
          },
        },
      }) as Promise<OrderWithItems | undefined>;
    },

    findOrderItem(itemId: string): Promise<OrderItem | undefined> {
      return db.query.orderItems.findFirst({
        where: eq(orderItems.id, itemId),
      });
    },

    async updateOrderItemStatus(
      itemId: string,
      newStatus: "confirmed" | "shipped" | "delivered" | "cancelled"
    ): Promise<OrderItem> {
      const [updated] = await db
        .update(orderItems)
        .set({ status: newStatus })
        .where(eq(orderItems.id, itemId))
        .returning();
      if (!updated) throw new Error("OrderItem not found");
      return updated;
    },
  };
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  bun run type-check
  ```

  Expected: passes with no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add apps/server/src/modules/orders/orders.schema.ts apps/server/src/modules/orders/orders.repository.ts
  git commit -m "feat(WINE-65): add orders schema and repository"
  ```

---

## Task 7: Orders Service

**Files:**
- Create: `apps/server/src/modules/orders/orders.service.ts`

- [ ] **Step 1: Create orders.service.ts**

  Create `apps/server/src/modules/orders/orders.service.ts`:

  ```typescript
  import { cartsRepository } from "../carts/carts.repository";
  import { shopsRepository } from "../shops/shops.repository";
  import type { OrderWithItems } from "./orders.repository";
  import { ordersRepository } from "./orders.repository";

  type CheckoutBody = {
    paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
    deliveryType: "pickup" | "shipping";
    shippingAddressId?: string;
    newShippingAddress?: {
      country: string;
      city: string;
      street: string;
      postalCode: string;
      houseNumber: string;
    };
    billingAddressId?: string;
    newBillingAddress?: {
      country: string;
      city: string;
      street: string;
      postalCode: string;
      houseNumber: string;
    };
  };

  export const ordersService = {
    async checkout(userId: string, body: CheckoutBody): Promise<OrderWithItems> {
      const cart = await cartsRepository.findByUserId(userId);
      if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

      if (!body.shippingAddressId && !body.newShippingAddress)
        throw new Error("MISSING_SHIPPING_ADDRESS");
      if (!body.billingAddressId && !body.newBillingAddress)
        throw new Error("MISSING_BILLING_ADDRESS");

      const shippingAddressId = body.newShippingAddress
        ? (await ordersRepository.insertAddress(body.newShippingAddress)).id
        : body.shippingAddressId!;

      const billingAddressId = body.newBillingAddress
        ? (await ordersRepository.insertAddress(body.newBillingAddress)).id
        : body.billingAddressId!;

      const totalPrice = cart.items
        .reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)
        .toFixed(2);

      const itemsData = cart.items.map((item) => ({
        shopId: item.product.shopId,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAtPurchase: item.product.price,
      }));

      const order = await ordersRepository.createOrderWithItems(
        {
          userId,
          shippingAddressId,
          billingAddressId,
          paymentMethod: body.paymentMethod,
          deliveryType: body.deliveryType,
          totalPrice,
        },
        itemsData,
        cart.id
      );

      const full = await ordersRepository.findOrderById(order.id);
      if (!full) throw new Error("Unexpected: order not found after creation");
      return full;
    },

    async getMyOrders(userId: string): Promise<OrderWithItems[]> {
      return ordersRepository.findOrdersByUserId(userId);
    },

    async getOrderById(userId: string, orderId: string): Promise<OrderWithItems> {
      const order = await ordersRepository.findOrderById(orderId);
      if (!order || order.userId !== userId) throw new Error("NOT_FOUND");
      return order;
    },

    async updateOrderItemStatus(
      shopOwnerUserId: string,
      orderId: string,
      itemId: string,
      newStatus: "confirmed" | "shipped" | "delivered" | "cancelled"
    ): Promise<OrderWithItems> {
      const shop = await shopsRepository.findByOwnerUserId(shopOwnerUserId);
      if (!shop) throw new Error("FORBIDDEN");

      const item = await ordersRepository.findOrderItem(itemId);
      if (!item || item.orderId !== orderId) throw new Error("NOT_FOUND");
      if (item.shopId !== shop.id) throw new Error("FORBIDDEN");

      await ordersRepository.updateOrderItemStatus(itemId, newStatus);

      const order = await ordersRepository.findOrderById(orderId);
      if (!order) throw new Error("Unexpected: order not found after status update");
      return order;
    },
  };
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  bun run type-check
  ```

  Expected: passes with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/server/src/modules/orders/orders.service.ts
  git commit -m "feat(WINE-65): add orders service with checkout and status update logic"
  ```

---

## Task 8: Orders Routes and Registration

**Files:**
- Create: `apps/server/src/modules/orders/orders.routes.ts`
- Create: `apps/server/src/modules/orders/index.ts`
- Modify: `apps/server/src/app.ts`

- [ ] **Step 1: Create orders.routes.ts**

  Create `apps/server/src/modules/orders/orders.routes.ts`:

  ```typescript
  import { Elysia, status, t } from "elysia";
  import { authPlugin } from "../auth";
  import { checkoutBody, updateItemStatusBody } from "./orders.schema";
  import { ordersService } from "./orders.service";

  function handleError(e: unknown) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return status(404, "Not found");
      if (e.message === "FORBIDDEN") return status(403, "Forbidden");
      if (e.message === "CART_EMPTY") return status(400, "Cart is empty");
      if (e.message === "MISSING_SHIPPING_ADDRESS")
        return status(400, "Shipping address is required");
      if (e.message === "MISSING_BILLING_ADDRESS")
        return status(400, "Billing address is required");
    }
    throw e;
  }

  export const ordersRoutes = new Elysia()
    .use(authPlugin)

    .post(
      "/orders",
      async ({ dbUser, body }) => {
        try {
          return status(201, await ordersService.checkout(dbUser.id, body));
        } catch (e) {
          return handleError(e);
        }
      },
      {
        requireAuth: true,
        body: checkoutBody,
        detail: {
          tags: ["orders"],
          summary: "Checkout — convert cart to order",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .get(
      "/orders",
      async ({ dbUser }) => ordersService.getMyOrders(dbUser.id),
      {
        requireAuth: true,
        detail: {
          tags: ["orders"],
          summary: "List current user's orders",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .get(
      "/orders/:id",
      async ({ dbUser, params }) => {
        try {
          return await ordersService.getOrderById(dbUser.id, params.id);
        } catch (e) {
          return handleError(e);
        }
      },
      {
        requireAuth: true,
        params: t.Object({ id: t.String() }),
        detail: {
          tags: ["orders"],
          summary: "Get order by ID (own orders only)",
          security: [{ bearerAuth: [] }],
        },
      }
    )

    .put(
      "/orders/:id/items/:itemId/status",
      async ({ dbUser, params, body }) => {
        try {
          return await ordersService.updateOrderItemStatus(
            dbUser.id,
            params.id,
            params.itemId,
            body.status
          );
        } catch (e) {
          return handleError(e);
        }
      },
      {
        requireCapability: "shop_owner",
        params: t.Object({ id: t.String(), itemId: t.String() }),
        body: updateItemStatusBody,
        detail: {
          tags: ["orders"],
          summary: "Update order item status (shop owner only)",
          security: [{ bearerAuth: [] }],
        },
      }
    );
  ```

- [ ] **Step 2: Create index.ts**

  Create `apps/server/src/modules/orders/index.ts`:

  ```typescript
  export { ordersRoutes } from "./orders.routes";
  ```

- [ ] **Step 3: Register ordersRoutes in app.ts**

  Open `apps/server/src/app.ts`. Add the import:

  ```typescript
  import { ordersRoutes } from "./modules/orders";
  ```

  Add `.use(ordersRoutes)` after `.use(cartsRoutes)`:

  ```typescript
  .use(cartsRoutes)
  .use(ordersRoutes);
  ```

  Also add `"carts"` and `"orders"` to the `tags` array in the openapi documentation:

  ```typescript
  { name: "carts", description: "Shopping cart operations" },
  { name: "orders", description: "Order checkout and lifecycle" },
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  bun run type-check
  ```

  Expected: passes with no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add apps/server/src/modules/orders/ apps/server/src/app.ts
  git commit -m "feat(WINE-65): add orders routes and register module"
  ```

---

## Task 9: Orders Tests

**Files:**
- Create: `apps/server/src/__tests__/orders.test.ts`

- [ ] **Step 1: Write the test file**

  Create `apps/server/src/__tests__/orders.test.ts`:

  ```typescript
  import { beforeEach, describe, expect, it, vi } from "vitest";

  vi.mock("../modules/orders/orders.repository", () => ({
    ordersRepository: {
      insertAddress: vi.fn(),
      createOrderWithItems: vi.fn(),
      findOrdersByUserId: vi.fn(),
      findOrderById: vi.fn(),
      findOrderItem: vi.fn(),
      updateOrderItemStatus: vi.fn(),
    },
  }));

  vi.mock("../modules/carts/carts.repository", () => ({
    cartsRepository: {
      findByUserId: vi.fn(),
    },
  }));

  vi.mock("../modules/shops/shops.repository", () => ({
    shopsRepository: {
      findByOwnerUserId: vi.fn(),
    },
  }));

  import { cartsRepository } from "../modules/carts/carts.repository";
  import { ordersRepository } from "../modules/orders/orders.repository";
  import { ordersService } from "../modules/orders/orders.service";
  import { shopsRepository } from "../modules/shops/shops.repository";

  const mockAddress = {
    id: "addr-1",
    country: "CZ",
    city: "Brno",
    street: "Náměstí Svobody",
    postalCode: "60200",
    houseNumber: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockProduct = { id: "prod-1", name: "Wine", price: "25.00", shopId: "shop-1" };

  const mockCartItem = {
    id: "ci-1",
    cartId: "cart-1",
    productId: "prod-1",
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: mockProduct,
  };

  const mockCartWithItems = {
    id: "cart-1",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [mockCartItem],
  };

  const mockOrder = {
    id: "order-1",
    userId: "user-1",
    status: "pending" as const,
    paymentStatus: "pending" as const,
    paymentMethod: "card" as const,
    deliveryType: "shipping" as const,
    totalPrice: "50.00",
    shippingFee: "0",
    discount: "0",
    shippingAddressId: "addr-1",
    billingAddressId: "addr-1",
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  };

  const mockOrderItem = {
    id: "oi-1",
    orderId: "order-1",
    shopId: "shop-1",
    productId: "prod-1",
    quantity: 2,
    unitPriceAtPurchase: "25.00",
    status: "pending" as const,
  };

  const mockOrderWithItems = { ...mockOrder, items: [{ ...mockOrderItem, product: mockProduct }] };

  const mockShop = {
    id: "shop-1",
    ownerUserId: "shop-owner-1",
    name: "Test Shop",
    description: "A shop",
    addressId: "addr-1",
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  };

  const checkoutBody = {
    paymentMethod: "card" as const,
    deliveryType: "shipping" as const,
    shippingAddressId: "addr-1",
    billingAddressId: "addr-1",
  };

  describe("ordersService.checkout", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws CART_EMPTY when cart is empty", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue({
        ...mockCartWithItems,
        items: [],
      } as any);

      await expect(ordersService.checkout("user-1", checkoutBody)).rejects.toThrow("CART_EMPTY");
    });

    it("throws CART_EMPTY when cart does not exist", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(undefined);

      await expect(ordersService.checkout("user-1", checkoutBody)).rejects.toThrow("CART_EMPTY");
    });

    it("throws MISSING_SHIPPING_ADDRESS when neither address field is provided", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as any);

      await expect(
        ordersService.checkout("user-1", {
          paymentMethod: "card",
          deliveryType: "shipping",
          billingAddressId: "addr-1",
        })
      ).rejects.toThrow("MISSING_SHIPPING_ADDRESS");
    });

    it("throws MISSING_BILLING_ADDRESS when neither billing field is provided", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as any);

      await expect(
        ordersService.checkout("user-1", {
          paymentMethod: "card",
          deliveryType: "shipping",
          shippingAddressId: "addr-1",
        })
      ).rejects.toThrow("MISSING_BILLING_ADDRESS");
    });

    it("inserts new address when newShippingAddress is provided", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as any);
      vi.mocked(ordersRepository.insertAddress).mockResolvedValue(mockAddress);
      vi.mocked(ordersRepository.createOrderWithItems).mockResolvedValue(mockOrder);
      vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as any);

      await ordersService.checkout("user-1", {
        paymentMethod: "card",
        deliveryType: "shipping",
        newShippingAddress: {
          country: "CZ",
          city: "Brno",
          street: "Náměstí Svobody",
          postalCode: "60200",
          houseNumber: "1",
        },
        billingAddressId: "addr-1",
      });

      expect(ordersRepository.insertAddress).toHaveBeenCalledTimes(1);
    });

    it("creates order with correct totalPrice and item data", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as any);
      vi.mocked(ordersRepository.createOrderWithItems).mockResolvedValue(mockOrder);
      vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as any);

      await ordersService.checkout("user-1", checkoutBody);

      expect(ordersRepository.createOrderWithItems).toHaveBeenCalledWith(
        expect.objectContaining({ totalPrice: "50.00", userId: "user-1" }),
        [
          {
            shopId: "shop-1",
            productId: "prod-1",
            quantity: 2,
            unitPriceAtPurchase: "25.00",
          },
        ],
        "cart-1"
      );
    });
  });

  describe("ordersService.getMyOrders", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns orders for the user", async () => {
      vi.mocked(ordersRepository.findOrdersByUserId).mockResolvedValue([mockOrderWithItems] as any);

      const result = await ordersService.getMyOrders("user-1");

      expect(ordersRepository.findOrdersByUserId).toHaveBeenCalledWith("user-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("ordersService.getOrderById", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns order when it belongs to the user", async () => {
      vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as any);

      const result = await ordersService.getOrderById("user-1", "order-1");

      expect(result.id).toBe("order-1");
    });

    it("throws NOT_FOUND when order belongs to another user", async () => {
      vi.mocked(ordersRepository.findOrderById).mockResolvedValue({
        ...mockOrderWithItems,
        userId: "user-other",
      } as any);

      await expect(ordersService.getOrderById("user-1", "order-1")).rejects.toThrow("NOT_FOUND");
    });

    it("throws NOT_FOUND when order does not exist", async () => {
      vi.mocked(ordersRepository.findOrderById).mockResolvedValue(undefined);

      await expect(ordersService.getOrderById("user-1", "order-1")).rejects.toThrow("NOT_FOUND");
    });
  });

  describe("ordersService.updateOrderItemStatus", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws FORBIDDEN when caller has no shop", async () => {
      vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(undefined);

      await expect(
        ordersService.updateOrderItemStatus("user-1", "order-1", "oi-1", "confirmed")
      ).rejects.toThrow("FORBIDDEN");
    });

    it("throws NOT_FOUND when item does not exist", async () => {
      vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as any);
      vi.mocked(ordersRepository.findOrderItem).mockResolvedValue(undefined);

      await expect(
        ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed")
      ).rejects.toThrow("NOT_FOUND");
    });

    it("throws NOT_FOUND when item belongs to a different order", async () => {
      vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as any);
      vi.mocked(ordersRepository.findOrderItem).mockResolvedValue({
        ...mockOrderItem,
        orderId: "order-other",
      } as any);

      await expect(
        ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed")
      ).rejects.toThrow("NOT_FOUND");
    });

    it("throws FORBIDDEN when item's shopId does not match caller's shop", async () => {
      vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue({
        ...mockShop,
        id: "shop-other",
      } as any);
      vi.mocked(ordersRepository.findOrderItem).mockResolvedValue(mockOrderItem as any);

      await expect(
        ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed")
      ).rejects.toThrow("FORBIDDEN");
    });

    it("updates status and returns the full order when ownership is valid", async () => {
      vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as any);
      vi.mocked(ordersRepository.findOrderItem).mockResolvedValue(mockOrderItem as any);
      vi.mocked(ordersRepository.updateOrderItemStatus).mockResolvedValue({
        ...mockOrderItem,
        status: "confirmed",
      } as any);
      vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as any);

      await ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed");

      expect(ordersRepository.updateOrderItemStatus).toHaveBeenCalledWith("oi-1", "confirmed");
    });
  });
  ```

- [ ] **Step 2: Run all tests**

  ```bash
  bun run test
  ```

  Expected: all tests pass (9 cart + 12 orders = 21 total). If any fail, fix the service or test before continuing.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/server/src/__tests__/orders.test.ts
  git commit -m "test(WINE-65): add orders service unit tests"
  ```

---

## Self-Review Checklist

- [x] **DB migration** — `orderItems.status` added using existing `orderStatusEnum`, no new type created
- [x] **Cart endpoints** — GET /carts/me, POST /carts/items, PUT /carts/items/:id, DELETE /carts/items/:id, POST /carts/merge all covered
- [x] **Orders endpoints** — POST /orders, GET /orders, GET /orders/:id, PUT /orders/:id/items/:itemId/status all covered
- [x] **Guest cart merge (DB wins)** — `mergeGuestItems` filters out products already in cart
- [x] **Multi-vendor checkout** — `orderItems.shopId` comes from `item.product.shopId`, correctly tags each item by shop
- [x] **Checkout transaction** — cart clearing + order + items all inside `db.transaction()` in `createOrderWithItems`
- [x] **Shop owner status update** — verifies `orderItem.shopId === shop.id` before updating
- [x] **New address support at checkout** — `insertAddress` called when `newShippingAddress`/`newBillingAddress` provided
- [x] **Type consistency** — `CartWithItems`, `OrderWithItems`, `CartItemWithProduct`, `OrderItemWithProduct` used consistently across repository/service
- [x] **Tests** — 9 cart + 12 orders service tests cover all key branches
