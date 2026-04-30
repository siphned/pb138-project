import { z } from "zod";

/**
 * Common enum schemas used across modules.
 * Single source of truth for validation + type inference.
 */

export const appRoleSchema = z.enum(["customer", "winemaker", "shop_owner", "admin"]);
export type AppRole = z.infer<typeof appRoleSchema>;

/**
 * Standard address validation.
 * Reused in checkout, shop creation, winemaker profile, etc.
 */
export const addressBodySchema = z.object({
  city: z.string().min(1, "City required").max(255),
  country: z.string().min(1, "Country required").max(50),
  houseNumber: z.string().min(1, "House number required").max(20),
  postalCode: z.string().min(1, "Postal code required").max(20),
  street: z.string().min(1, "Street required").max(255),
  type: z.enum(["shipping", "billing"]).optional(),
});
export type AddressBody = z.infer<typeof addressBodySchema>;
