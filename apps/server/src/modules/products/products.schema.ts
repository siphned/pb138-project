import { t } from "elysia";

const wineEntry = t.Object({
  quantity: t.Integer({ minimum: 1 }),
  wineId: t.String({ format: "uuid" }),
});

export const createProductOrBundleBody = t.Union([
  t.Object({
    description: t.Optional(t.String({ minLength: 1 })),
    name: t.String({ maxLength: 255, minLength: 1 }),
    price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
    quantity: t.Integer({ minimum: 0 }),
    wineId: t.String({ format: "uuid" }),
  }),
  t.Object({
    description: t.Optional(t.String({ minLength: 1 })),
    name: t.String({ maxLength: 255, minLength: 1 }),
    price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
    quantity: t.Integer({ minimum: 0 }),
    wines: t.Array(wineEntry, { minItems: 2 }),
  }),
]);

export const updateProductOrBundleBody = t.Object({
  description: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  name: t.Optional(t.String({ maxLength: 255, minLength: 1 })),
  price: t.Optional(t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" })),
  quantity: t.Optional(t.Integer({ minimum: 0 })),
  wineId: t.Optional(t.String({ format: "uuid" })),
  wines: t.Optional(t.Array(wineEntry, { minItems: 2 })),
});

// ── Catalog (GET /products) ────────────────────────────────────────────────

const catalogWineType = t.Union([
  t.Literal("still"),
  t.Literal("sparkling"),
  t.Literal("fortified"),
  t.Literal("dessert"),
]);

const catalogWineColor = t.Union([
  t.Literal("red"),
  t.Literal("white"),
  t.Literal("rosé"),
  t.Literal("orange"),
  t.Literal("gray"),
  t.Literal("tawny"),
  t.Literal("yellow"),
]);

export const getAllProductsQuery = t.Object({
  color: t.Optional(catalogWineColor),
  isBundle: t.Optional(t.BooleanString()),
  maxPrice: t.Optional(t.Numeric()),
  minPrice: t.Optional(t.Numeric()),
  page: t.Optional(t.Integer({ minimum: 1 })),
  q: t.Optional(t.String()),
  rating: t.Optional(t.Numeric({ maximum: 5, minimum: 1 })),
  region: t.Optional(t.String()),
  shopId: t.Optional(t.String({ format: "uuid" })),
  sort: t.Optional(
    t.Union([
      t.Literal("newest"),
      t.Literal("price-asc"),
      t.Literal("price-desc"),
      t.Literal("rating"),
    ])
  ),
  type: t.Optional(catalogWineType),
  wineId: t.Optional(t.String({ format: "uuid" })),
});

const catalogWineItem = t.Object({
  color: t.String(),
  id: t.String(),
  name: t.String(),
  region: t.String(),
  type: t.String(),
  vintageYear: t.Integer(),
  winemaker: t.Object({ name: t.String() }),
});

const catalogProductItem = t.Object({
  id: t.String(),
  isBundle: t.Boolean(),
  name: t.String(),
  price: t.String(),
  quantity: t.Integer(),
  rating: t.Nullable(t.Number()),
  reviewCount: t.Integer(),
  shop: t.Object({ id: t.String(), name: t.String() }),
  wines: t.Array(catalogWineItem),
});

export const getAllProductsResponse = t.Object({
  data: t.Array(catalogProductItem),
  limit: t.Integer(),
  page: t.Integer(),
  total: t.Integer(),
});
