export const Role = {
  WINEMAKER: "Winemaker",
  SHOP_OWNER: "Shop Owner",
  CUSTOMER: "Customer",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
