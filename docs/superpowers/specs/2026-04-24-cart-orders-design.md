# Cart & Orders Module Design

**Date:** 2026-04-24  
**Scope:** `modules/carts/` and `modules/orders/` — shopping cart operations, checkout, and order lifecycle  
**Author:** Ondrej Malek

---

## Decisions

| Question | Decision |
|----------|----------|
| Guest cart storage | Frontend-only (localStorage); merge via `POST /carts/merge` |
| Order-per-shop vs single order | Single order per checkout; `orderItems.shopId` tags shop ownership |
| Shop owner status granularity | Item-level status on `order_items` (migration required) |
| Checkout address input | Full: `paymentMethod`, `deliveryType`, address ID or new address object |
| Cart merge conflict resolution | DB wins — existing quantity kept, guest quantity ignored |

---

## Database Migration

Add `status` column to `order_items`. No other schema changes needed — `carts`, `cart_items`, `orders`, and `order_items` tables already exist.

```sql
ALTER TABLE order_items
  ADD COLUMN status order_status NOT NULL DEFAULT 'pending';
```

Reuses the existing `order_status` enum (same values: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`). No new enum type needed.

Update `apps/server/src/db/schema/orders.ts` to add the `status` field to `orderItems` using the existing `orderStatus` enum.  
Run `bun run db:generate` then `bun run db:migrate` to apply.

---

## Module Structure

```
apps/server/src/modules/
├── carts/
│   ├── carts.routes.ts
│   ├── carts.service.ts
│   ├── carts.repository.ts
│   ├── carts.schema.ts
│   └── index.ts
└── orders/
    ├── orders.routes.ts
    ├── orders.service.ts
    ├── orders.repository.ts
    ├── orders.schema.ts
    └── index.ts
```

Both modules are registered in `apps/server/src/app.ts` alongside existing modules.

---

## Cart Module (`modules/carts/`)

### Endpoints

All endpoints require `requireAuth`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/carts/me` | Get current user's cart with items and product details |
| `POST` | `/carts/items` | Add item to cart (creates cart if none exists) |
| `PUT` | `/carts/items/:id` | Update item quantity |
| `DELETE` | `/carts/items/:id` | Remove item from cart |
| `POST` | `/carts/merge` | Merge guest items from localStorage into user cart |

### Schema (Zod / Elysia `t`)

```ts
// Request bodies
AddItemBody    = { productId: uuid, quantity: int (min 1) }
UpdateItemBody = { quantity: int (min 1) }
MergeBody      = { items: Array<{ productId: uuid, quantity: int (min 1) }> }

// Response
CartItemResponse = {
  id, cartId, productId, quantity,
  product: { id, name, price, shopId }
}
CartResponse = { id, userId, items: CartItemResponse[] }
```

### Repository

| Function | Description |
|----------|-------------|
| `findCartByUserId(userId)` | Cart with items + product (name, price, shopId) |
| `upsertCart(userId)` | Find or insert cart row |
| `findCartItem(cartItemId)` | Single item for ownership checks |
| `addItem(cartId, productId, quantity)` | Insert; if product already in cart, increment quantity |
| `updateItem(cartItemId, quantity)` | Set new quantity |
| `removeItem(cartItemId)` | Delete row |
| `clearCart(cartId)` | Delete all items (used by checkout) |
| `mergeGuestItems(cartId, items)` | Insert only items whose productId is not already in cart |

### Service

- `getMyCart(userId)` — upsert cart, return with items
- `addItem(userId, productId, quantity)` — verify product exists and is not soft-deleted, then add
- `updateItem(userId, cartItemId, quantity)` — verify item belongs to user's cart, then update
- `removeItem(userId, cartItemId)` — verify item belongs to user's cart, then remove
- `mergeGuestItems(userId, items)` — upsert cart, delegate to repository (DB wins on conflict)

---

## Orders Module (`modules/orders/`)

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/orders` | `requireAuth` | Checkout — convert cart to order |
| `GET` | `/orders` | `requireAuth` | List customer's own orders with items |
| `GET` | `/orders/:id` | `requireAuth` | Single order detail (own orders only) |
| `PUT` | `/orders/:id/items/:itemId/status` | `requireCapability("shop_owner")` | Update item status |

### Schema (Zod / Elysia `t`)

```ts
// Checkout request body
CheckoutBody = {
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery",
  deliveryType: "pickup" | "shipping",
  shippingAddressId?: uuid,
  newShippingAddress?: AddressInput,   // { country, city, street, postalCode, houseNumber }
  billingAddressId?: uuid,
  newBillingAddress?: AddressInput,
}
// At least one of shippingAddressId / newShippingAddress required
// At least one of billingAddressId / newBillingAddress required

// Status update body
UpdateItemStatusBody = {
  status: "confirmed" | "shipped" | "delivered" | "cancelled"
}

// Responses
OrderItemResponse = { id, productId, shopId, quantity, unitPriceAtPurchase, status }
OrderResponse     = { id, userId, status, paymentStatus, paymentMethod, deliveryType,
                      totalPrice, shippingFee, discount,
                      shippingAddressId, billingAddressId, createdAt,
                      items: OrderItemResponse[] }
```

### Checkout Flow (`POST /orders`)

All DB writes in a single transaction:

1. Load user's cart with items (including `product.price` and `product.shopId`)
2. Reject `400` if cart is empty
3. If `newShippingAddress` provided → insert into `addresses` → capture new ID; else use `shippingAddressId`
4. Same for billing address
5. Calculate `totalPrice = Σ (product.price × quantity)`
6. Insert one `orders` row (`userId`, addresses, `paymentMethod`, `deliveryType`, `status: "pending"`, `paymentStatus: "pending"`, `totalPrice`, `shippingFee: 0`, `discount: 0`)
7. Insert `order_items` rows — one per cart item with `shopId`, `productId`, `quantity`, `unitPriceAtPurchase = product.price`, `status: "pending"`
8. Clear cart (`DELETE FROM cart_items WHERE cartId = ?`)
9. Return created order with items

### Shop Owner Status Update (`PUT /orders/:id/items/:itemId/status`)

1. Load `orderItem` by `itemId`; 404 if not found
2. Load caller's shop via `shops.ownerUserId = dbUser.id`; 403 if no shop
3. Verify `orderItem.shopId = shop.id`; 403 if mismatch
4. Update `orderItem.status` to requested value
5. Return updated order item

No transition validation enforced — any status value accepted.

### Repository

| Function | Description |
|----------|-------------|
| `createOrder(tx, data)` | Insert order row, return created |
| `createOrderItems(tx, items)` | Bulk insert order items |
| `findOrdersByUserId(userId)` | All orders for user with items |
| `findOrderById(orderId)` | Single order with items + product details |
| `findOrderItem(itemId)` | Single item for shop ownership check |
| `updateOrderItemStatus(itemId, status)` | Update item status column |

### Service

- `checkout(userId, body)` — full checkout flow in transaction (calls cart repository for items, then clears cart)
- `getMyOrders(userId)` — list own orders
- `getOrderById(userId, orderId)` — own order or 404
- `updateOrderItemStatus(shopOwnerUserId, orderId, itemId, status)` — ownership check + update

---

## Testing

Files: `apps/server/src/__tests__/carts.test.ts` and `orders.test.ts`  
Framework: Vitest with real test DB (no mocks).  
Target: >60% coverage.

### Cart Tests

- `GET /carts/me` — empty cart for new user; returns items for existing cart
- `POST /carts/items` — creates cart on first add; increments quantity on duplicate product; 404 on unknown product
- `PUT /carts/items/:id` — updates quantity; 403 if item belongs to another user's cart
- `DELETE /carts/items/:id` — removes item; 403 if not own item
- `POST /carts/merge` — adds guest items not in cart; skips items already present (DB wins)

### Order Tests

- `POST /orders` — 400 on empty cart; creates order with correct `unitPriceAtPurchase` snapshot; inserts all items with correct `shopId`; clears cart after checkout; inserts new address when provided
- `GET /orders` — returns only the calling user's orders
- `GET /orders/:id` — 404 for another user's order
- `PUT /orders/:id/items/:itemId/status` — shop owner updates own item; 403 if `orderItem.shopId` doesn't match caller's shop

---

## Integration Points

- **`app.ts`** — register `cartsRoutes` and `ordersRoutes` alongside existing modules
- **`orders.service.ts` → `carts.repository`** — checkout reads cart items and clears cart; import `cartsRepository` directly (no circular dependency since carts module doesn't import orders)
- **Auth macros** — `requireAuth` for all cart routes and customer order routes; `requireCapability("shop_owner")` for the status update endpoint
