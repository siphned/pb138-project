import type { AppRole } from "@repo/shared";

export type { AppRole };

export const Role = {
  customer: "Customer",
  shopOwner: "Shop Owner",
  winemaker: "Winemaker",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
