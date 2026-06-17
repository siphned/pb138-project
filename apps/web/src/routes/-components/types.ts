import type { GetEventsQueryParams } from "@/generated/types/GetEvents";
import type { GetProductsQueryParams } from "@/generated/types/GetProducts";
import type { GetWinesQueryParams } from "@/generated/types/GetWines";

/** Coerces an unknown URL-search value into `string | undefined`. */
export const asString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

/**
 * Coerces an unknown URL-search value into `number | undefined`. Numeric query
 * params are typed as `number` by the generated Kubb client (the backend Zod
 * schemas coerce them), so string values from the URL are parsed here.
 */
export const asNumOrStr = (v: unknown): number | undefined => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
};

export type WineSearch = GetWinesQueryParams & { q?: string; sort?: string };
// `isBundle` and `shopId` aren't in the OpenAPI list endpoint yet; we keep
// them as UI-only fields and strip before passing to the hook. Track in
// WINE-XXX BE follow-up.
export type ProductSearch = GetProductsQueryParams & {
  isBundle?: boolean | "true" | "false";
  shopId?: string;
};
export type EventSearch = GetEventsQueryParams;
export type WinemakerSearch = { q?: string; city?: string };
export type ShopSearch = { q?: string; city?: string };

// Aggregated search-page state — spans wines + products + winemakers + shops.
// Each sub-query strips the fields its endpoint doesn't accept.
export type SearchPageSearch = WineSearch & {
  minPrice?: number;
  maxPrice?: number;
  isBundle?: boolean;
};

export type EntityKind = "wines" | "products" | "winemakers" | "shops" | "events";

export type SearchFor<E extends EntityKind> = E extends "wines"
  ? WineSearch
  : E extends "products"
    ? ProductSearch
    : E extends "events"
      ? EventSearch
      : E extends "winemakers"
        ? WinemakerSearch
        : E extends "shops"
          ? ShopSearch
          : never;
