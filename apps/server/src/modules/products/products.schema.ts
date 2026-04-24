import { t } from "elysia";

export const createProductBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ minLength: 1 })),
  price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  quantity: t.Integer({ minimum: 0 }),
  wineId: t.String({ format: "uuid" }),
});

export const updateProductBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  price: t.Optional(t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" })),
  quantity: t.Optional(t.Integer({ minimum: 0 })),
  wineId: t.Optional(t.String({ format: "uuid" })),
});

const wineEntry = t.Object({
  wineId: t.String({ format: "uuid" }),
  quantity: t.Integer({ minimum: 1 }),
});

export const createBundleBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ minLength: 1 })),
  price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  quantity: t.Integer({ minimum: 0 }),
  wines: t.Array(wineEntry, { minItems: 2 }),
});

export const updateBundleBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  price: t.Optional(t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" })),
  quantity: t.Optional(t.Integer({ minimum: 0 })),
  wines: t.Optional(t.Array(wineEntry, { minItems: 2 })),
});
