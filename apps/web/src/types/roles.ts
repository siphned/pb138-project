import type { AppRole } from "@repo/shared";

export type { AppRole };

export const Role = {
  admin: "Admin",
  customer: "Customer",
  shopOwner: "Shop Owner",
  winemaker: "Winemaker",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
