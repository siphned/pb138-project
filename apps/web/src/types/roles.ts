export type AppRole = "customer" | "winemaker" | "shop_owner" | "admin";

export const Role = {
  winemaker: "Winemaker",
  shopOwner: "Shop Owner",
  customer: "Customer",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
