export type AppRole = "customer" | "winemaker" | "shop_owner" | "admin";

export const Role = {
  customer: "Customer",
  shopOwner: "Shop Owner",
  winemaker: "Winemaker",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
