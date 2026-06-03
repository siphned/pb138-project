import { t } from "elysia";

const wineType = t.Union([
  t.Literal("still"),
  t.Literal("sparkling"),
  t.Literal("fortified"),
  t.Literal("dessert"),
]);

const wineColor = t.Union([
  t.Literal("red"),
  t.Literal("white"),
  t.Literal("rosé"),
  t.Literal("orange"),
  t.Literal("gray"),
  t.Literal("tawny"),
  t.Literal("yellow"),
]);

export const createWineBody = t.Object({
  alcoholContent: t.String({ pattern: "^\\d{1,2}(\\.\\d{1,2})?$" }),
  attribution: t.String({ minLength: 1 }),
  color: wineColor,
  composition: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  name: t.String({ maxLength: 255, minLength: 1 }),
  quantity: t.Integer({ minimum: 0 }),
  region: t.String({ maxLength: 255, minLength: 1 }),
  type: wineType,
  vintageYear: t.Integer({ maximum: 2100, minimum: 1800 }),
  volumeMl: t.Integer({ minimum: 1 }),
});

export const updateWineBody = createWineBody;

export const wineFiltersQuery = t.Object({
  color: t.Optional(wineColor),
  q: t.Optional(t.String({ maxLength: 255 })),
  region: t.Optional(t.String()),
  type: t.Optional(wineType),
  vintageYear: t.Optional(t.Numeric()),
  winemakerId: t.Optional(t.String()),
});

export const wineResponse = t.Object({
  alcoholContent: t.String(),
  attribution: t.String(),
  color: t.String(),
  composition: t.String(),
  createdAt: t.Date(),
  description: t.String(),
  id: t.String(),
  imageUrl: t.Optional(t.Nullable(t.String())),
  name: t.String(),
  quantity: t.Integer(),
  region: t.String(),
  type: t.String(),
  updatedAt: t.Date(),
  vintageYear: t.Integer(),
  volumeMl: t.Integer(),
  winemaker: t.Object({ id: t.String(), name: t.String() }),
  winemakerId: t.String(),
});
