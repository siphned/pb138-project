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
