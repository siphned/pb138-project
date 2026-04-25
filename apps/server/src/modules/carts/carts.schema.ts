import { t } from "elysia";

const cartProductResponse = t.Object({
  id: t.String(),
  name: t.String(),
  price: t.String(),
  shopId: t.String(),
  quantity: t.Integer(),
});

export const cartItemResponse = t.Object({
  id: t.String(),
  cartId: t.String(),
  productId: t.String(),
  quantity: t.Integer(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  product: cartProductResponse,
});

export const cartResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  items: t.Array(cartItemResponse),
});

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
