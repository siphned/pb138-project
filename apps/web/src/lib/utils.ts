import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000";

// Converts a relative /uploads/... path from the API into an absolute URL
// pointing at the backend. Absolute URLs (http/https) are returned unchanged.
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse a decimal money string (Drizzle numeric arrives as a string, e.g.
// "13.77") into integer cents. Working in cents avoids the float rounding that
// accumulates when summing price * quantity directly across many line items.
export function toCents(value: number | string): number {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

// Line total (price × quantity) computed in integer cents, returned as euros.
export function lineTotalEur(price: number | string, quantity: number): number {
  return (toCents(price) * quantity) / 100;
}

// Formats a money value as euros with the symbol after the amount ("13.77 €"),
// matching local (SK/CZ) convention. Single source for price display across the app.
export function formatEur(
  value: number | string,
  { decimals = 2 }: { decimals?: number } = {}
): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  const amount = new Intl.NumberFormat("en-IE", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(safe);
  return `${amount} €`;
}
