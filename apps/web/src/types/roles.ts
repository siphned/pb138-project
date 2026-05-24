<<<<<<< HEAD
import type { AppRole } from "@repo/shared";

export type { AppRole };

export const Role = {
  admin: "Admin",
=======
export type AppRole = "customer" | "winemaker" | "shop_owner" | "admin";

export const Role = {
>>>>>>> origin/main
  customer: "Customer",
  shopOwner: "Shop Owner",
  winemaker: "Winemaker",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
