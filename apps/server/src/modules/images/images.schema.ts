import { t } from "elysia";
import { z } from "zod";

export const VALID_ENTITY_TYPES = ["event", "product", "shop", "wine", "winemaker"] as const;

export const entityTypeSchema = z.enum(["event", "product", "shop", "wine", "winemaker"]);

export const imageResponse = z.object({
  createdAt: z.date(),
  entityId: z.string(),
  entityType: z.string(),
  id: z.string(),
  url: z.string(),
});

// File upload stays on TypeBox: Elysia's multipart handling binds to t.File;
// Zod has no clean equivalent for multipart/OpenAPI here.
export const uploadImageBody = t.Object({
  file: t.File(),
});
