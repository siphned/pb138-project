import { boolean, decimal, numeric, pgTable, smallint, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { wineColorEnum, wineTypeEnum } from './enums'
import { timestamptz } from './helpers'
import { shops, winemakers } from './sellers'

export const wines = pgTable('wines', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').notNull().references(() => winemakers.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  composition: text('composition').notNull(),
  attribution: text('attribution').notNull(),
  region: varchar('region', { length: 255 }).notNull(),
  vintageYear: smallint('vintage_year').notNull(),
  type: wineTypeEnum('type').notNull(),
  color: wineColorEnum('color').notNull(),
  alcoholContent: decimal('alcohol_content', { precision: 4, scale: 2 }).notNull(),
  volumeMl: smallint('volume_ml').notNull(),
  quantity: smallint('quantity').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
  deletedAt: timestamptz('deleted_at'),
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: smallint('quantity').notNull(),
  isBundle: boolean('is_bundle').notNull().default(false),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at'),
  deletedAt: timestamptz('deleted_at'),
})

export const productWines = pgTable('product_wines', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  wineId: uuid('wine_id').notNull().references(() => wines.id),
  quantity: smallint('quantity').notNull(),
})
