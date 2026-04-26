import { t } from "elysia";

export const createProductBody = t.Object({
  description: t.Optional(t.String({ minLength: 1 })),
  name: t.String({ maxLength: 255, minLength: 1 }),
  price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  quantity: t.Integer({ minimum: 0 }),
  wineId: t.String({ format: "uuid" }),
});

export const updateProductBody = t.Object({
  description: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  name: t.Optional(t.String({ maxLength: 255, minLength: 1 })),
  price: t.Optional(t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" })),
  quantity: t.Optional(t.Integer({ minimum: 0 })),
  wineId: t.Optional(t.String({ format: "uuid" })),
});

const wineEntry = t.Object({
  quantity: t.Integer({ minimum: 1 }),
  wineId: t.String({ format: "uuid" }),
});

export const createBundleBody = t.Object({
  description: t.Optional(t.String({ minLength: 1 })),
  name: t.String({ maxLength: 255, minLength: 1 }),
  price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  quantity: t.Integer({ minimum: 0 }),
  wines: t.Array(wineEntry, { minItems: 2 }),
});

export const updateBundleBody = t.Object({
  description: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  name: t.Optional(t.String({ maxLength: 255, minLength: 1 })),
  price: t.Optional(t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" })),
  quantity: t.Optional(t.Integer({ minimum: 0 })),
  wines: t.Optional(t.Array(wineEntry, { minItems: 2 })),
});
