import { z } from "zod";

const wineType = z.enum(["still", "sparkling", "fortified", "dessert"]);

const wineColor = z.enum(["red", "white", "rosé", "orange", "gray", "tawny", "yellow"]);

export const createWineBody = z.object({
  alcoholContent: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/),
  attribution: z.string().min(1),
  color: wineColor,
  composition: z.string().min(1),
  description: z.string().min(1),
  name: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
  region: z.string().min(1).max(255),
  type: wineType,
  vintageYear: z.number().int().min(1800).max(2100),
  volumeMl: z.number().int().min(1),
});

export const updateWineBody = createWineBody;

export const wineFiltersQuery = z.object({
  color: wineColor.optional(),
  q: z.string().max(255).optional(),
  region: z.string().optional(),
  type: wineType.optional(),
  vintageYear: z.coerce.number().optional(),
  winemakerId: z.string().optional(),
});

export const wineResponse = z.object({
  alcoholContent: z.string(),
  attribution: z.string(),
  color: z.string(),
  composition: z.string(),
  createdAt: z.date(),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  quantity: z.number().int(),
  region: z.string(),
  type: z.string(),
  updatedAt: z.date(),
  vintageYear: z.number().int(),
  volumeMl: z.number().int(),
  winemaker: z.object({ id: z.string(), name: z.string() }),
  winemakerId: z.string(),
});
