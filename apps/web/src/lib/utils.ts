import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
