import { z } from "zod";

const wineEntry = z.object({
  quantity: z.number().int().min(1),
  wineId: z.string().uuid(),
});

const priceString = z.string().regex(/^\d+(\.\d{1,2})?$/);

export const createProductOrBundleBody = z.union([
  z.object({
    description: z.string().min(1).optional(),
    name: z.string().min(1).max(255),
    price: priceString,
    quantity: z.number().int().min(0),
    wineId: z.string().uuid(),
  }),
  z.object({
    description: z.string().min(1).optional(),
    name: z.string().min(1).max(255),
    price: priceString,
    quantity: z.number().int().min(0),
    wines: z.array(wineEntry).min(2),
  }),
]);

export const updateProductOrBundleBody = z.object({
  description: z.string().min(1).nullable().optional(),
  name: z.string().min(1).max(255).optional(),
  price: priceString.optional(),
  quantity: z.number().int().min(0).optional(),
  wineId: z.string().uuid().optional(),
  wines: z.array(wineEntry).min(2).optional(),
});

const catalogWineType = z.enum(["still", "sparkling", "fortified", "dessert"]);

const catalogWineColor = z.enum(["red", "white", "rosé", "orange", "gray", "tawny", "yellow"]);

export const getAllProductsQuery = z.object({
  color: catalogWineColor.optional(),
  containsProductId: z.string().uuid().optional(),
  isBundle: z
    .preprocess((v) => {
      if (typeof v === "boolean") return v;
      if (v === "true") return true;
      if (v === "false") return false;
      return v;
    }, z.boolean())
    .optional(),
  maxPrice: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
  q: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  region: z.string().optional(),
  shopId: z.string().uuid().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).optional(),
  type: catalogWineType.optional(),
  wineId: z.string().uuid().optional(),
});

const catalogWineItem = z.object({
  color: z.string(),
  id: z.string(),
  name: z.string(),
  region: z.string(),
  type: z.string(),
  vintageYear: z.number().int(),
  winemaker: z.object({ name: z.string() }),
});

const catalogProductItem = z.object({
  id: z.string(),
  isBundle: z.boolean(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().int(),
  rating: z.number().nullable(),
  reviewCount: z.number().int(),
  shop: z.object({ id: z.string(), name: z.string() }),
  wines: z.array(catalogWineItem),
});

export const getAllProductsResponse = z.object({
  data: z.array(catalogProductItem),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
});
