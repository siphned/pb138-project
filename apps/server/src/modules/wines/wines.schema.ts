import { t } from 'elysia'

const wineType = t.Union([
  t.Literal('still'),
  t.Literal('sparkling'),
  t.Literal('fortified'),
  t.Literal('dessert'),
])

const wineColor = t.Union([
  t.Literal('red'),
  t.Literal('white'),
  t.Literal('rosé'),
  t.Literal('orange'),
  t.Literal('gray'),
  t.Literal('tawny'),
  t.Literal('yellow'),
])

export const createWineBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.String({ minLength: 1 }),
  composition: t.String({ minLength: 1 }),
  attribution: t.String({ minLength: 1 }),
  region: t.String({ minLength: 1, maxLength: 255 }),
  vintageYear: t.Integer({ minimum: 1800, maximum: 2100 }),
  type: wineType,
  color: wineColor,
  alcoholContent: t.String({ pattern: '^\\d{1,2}(\\.\\d{1,2})?$' }),
  volumeMl: t.Integer({ minimum: 1 }),
  quantity: t.Integer({ minimum: 0 }),
})

export const updateWineBody = createWineBody

export const wineFiltersQuery = t.Object({
  region: t.Optional(t.String()),
  type: t.Optional(wineType),
  color: t.Optional(wineColor),
  vintageYear: t.Optional(t.Numeric()),
  winemakerId: t.Optional(t.String()),
})

export const wineResponse = t.Object({
  id: t.String(),
  winemakerId: t.String(),
  winemaker: t.Object({ id: t.String(), name: t.String() }),
  name: t.String(),
  description: t.String(),
  composition: t.String(),
  attribution: t.String(),
  region: t.String(),
  vintageYear: t.Integer(),
  type: t.String(),
  color: t.String(),
  alcoholContent: t.String(),
  volumeMl: t.Integer(),
  quantity: t.Integer(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})
