import type { GetEventsQueryParams } from "@/generated/types/GetEvents";
import type { GetProductsQueryParams } from "@/generated/types/GetProducts";
import type { GetWinesQueryParams } from "@/generated/types/GetWines";

export type WineSearch = GetWinesQueryParams & { q?: string };
// isBundle isn't in the OpenAPI list endpoint yet; we keep it as a UI-only field
// and strip it before passing to the hook. Track in WINE-XXX BE follow-up.
export type ProductSearch = GetProductsQueryParams & { isBundle?: boolean };
export type EventSearch = GetEventsQueryParams;
export type WinemakerSearch = { q?: string };
export type ShopSearch = { q?: string };

// Aggregated search-page state — spans wines + products + winemakers + shops.
// Each sub-query strips the fields its endpoint doesn't accept.
export type SearchPageSearch = WineSearch & {
  minPrice?: string | number;
  maxPrice?: string | number;
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
