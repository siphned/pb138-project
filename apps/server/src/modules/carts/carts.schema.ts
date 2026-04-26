import { t } from "elysia";

const cartProductResponse = t.Object({
  id: t.String(),
  name: t.String(),
  price: t.String(),
  quantity: t.Integer(),
  shopId: t.String(),
});

export const cartItemResponse = t.Object({
  cartId: t.String(),
  createdAt: t.Date(),
  id: t.String(),
  product: cartProductResponse,
  productId: t.String(),
  quantity: t.Integer(),
  updatedAt: t.Date(),
});

export const cartResponse = t.Object({
  createdAt: t.Date(),
  id: t.String(),
  items: t.Array(cartItemResponse),
  updatedAt: t.Date(),
  userId: t.String(),
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
