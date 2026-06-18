import { z } from "zod";

/**
 * Single source of truth for address-field validation. Every form that collects an
 * address (winemaker, shop, event, settings, checkout shipping + billing) composes
 * `addressSchemaShape` so the rules stay identical everywhere. Pair with the shared
 * `AddressFields` component for the matching UI.
 */
export const POSTAL_CODE_REGEX = /^[\d\s-]{3,10}$/;
export const COUNTRY_REGEX = /^[\p{L}\s'-]+$/u;
export const HOUSE_NUMBER_REGEX = /^\d+[a-zA-Z]?(\/\d+)?$/;

export const POSTAL_CODE_MESSAGE = "Postal code must be 3-10 digits (e.g., 60200 or 602 00)";
export const COUNTRY_MESSAGE = "Country must contain only letters";
export const HOUSE_NUMBER_MESSAGE =
  "House number must be digits, optionally with one letter (e.g., 68A)";

export const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);

/** Validated fields for a single address. Spread into a form's `z.object({ ... })`. */
export const addressSchemaShape = {
  city: requiredString("City"),
  country: requiredString("Country").regex(COUNTRY_REGEX, COUNTRY_MESSAGE),
  houseNumber: requiredString("House number").regex(HOUSE_NUMBER_REGEX, HOUSE_NUMBER_MESSAGE),
  postalCode: requiredString("Postal code").regex(POSTAL_CODE_REGEX, POSTAL_CODE_MESSAGE),
  street: requiredString("Street"),
};

/** Standalone schema + type for forms that collect only an address. */
export const addressSchema = z.object(addressSchemaShape);
export type AddressSchemaValues = z.infer<typeof addressSchema>;
