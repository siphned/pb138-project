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
