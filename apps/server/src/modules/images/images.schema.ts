import { t } from "elysia";

export const VALID_ENTITY_TYPES = ["event", "product", "shop", "wine", "winemaker"] as const;

export const imageResponse = t.Object({
  createdAt: t.Date(),
  entityId: t.String(),
  entityType: t.String(),
  id: t.String(),
  url: t.String(),
});

export const uploadImageBody = t.Object({
  file: t.File(),
});
