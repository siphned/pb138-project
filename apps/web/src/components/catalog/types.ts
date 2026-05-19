import type { GetEventsQueryParams } from "@/generated/types/GetEvents";
import type { GetProductsQueryParams } from "@/generated/types/GetProducts";
import type { GetWinesQueryParams } from "@/generated/types/GetWines";

/** Coerces an unknown URL-search value into `string | undefined`. */
export const asString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

/**
 * Coerces an unknown URL-search value into a numeric/stringy ID that the
 * generated Kubb param types accept (most numeric query params are typed
 * as `string | number` because TanStack Router serialises them as strings).
 */
export const asNumOrStr = (v: unknown): string | number | undefined =>
  typeof v === "string" || typeof v === "number" ? v : undefined;

export type WineSearch = GetWinesQueryParams & { q?: string };
export type ProductSearch = GetProductsQueryParams;
export type EventSearch = GetEventsQueryParams;
export type WinemakerSearch = { q?: string };
export interface ShopSearch {
  q?: string;
  city?: string;
  ownerUserId?: string;
}

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
