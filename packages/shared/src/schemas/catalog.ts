import {
  boolean,
  decimal,
  numeric,
  pgTable,
  smallint,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { wineColorEnum, wineTypeEnum } from "./enums";
import { timestamptz } from "./helpers";
import { shops, winemakers } from "./sellers";

export const wines = pgTable("wines", {
  alcoholContent: decimal("alcohol_content", { precision: 4, scale: 2 }).notNull(),
  attribution: text("attribution").notNull(),
  color: wineColorEnum("color").notNull(),
  composition: text("composition").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  description: text("description").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: smallint("quantity").notNull(),
  region: varchar("region", { length: 255 }).notNull(),
  type: wineTypeEnum("type").notNull(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  vintageYear: smallint("vintage_year").notNull(),
  volumeMl: smallint("volume_ml").notNull(),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
});

export const products = pgTable("products", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  description: text("description"),
  id: uuid("id").primaryKey().defaultRandom(),
  isBundle: boolean("is_bundle").notNull().default(false),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: smallint("quantity").notNull(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  updatedAt: timestamptz("updated_at"),
});

export const productWines = pgTable("product_wines", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: smallint("quantity").notNull(),
  updatedAt: timestamptz("updated_at"),
  wineId: uuid("wine_id")
    .notNull()
    .references(() => wines.id),
});

// Zod schemas for validation + type inference
export const wineSelectSchema = createSelectSchema(wines);
export const wineInsertSchema = createInsertSchema(wines);
export type WineModel = typeof wines.$inferSelect;

export const productSelectSchema = createSelectSchema(products);
export const productInsertSchema = createInsertSchema(products);
export type ProductModel = typeof products.$inferSelect;

export const productWineSelectSchema = createSelectSchema(productWines);
export const productWineInsertSchema = createInsertSchema(productWines);
export type ProductWineModel = typeof productWines.$inferSelect;
