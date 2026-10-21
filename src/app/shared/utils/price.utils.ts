/**
 * Converts a display price such as "Rs. 4,499" into the number 4499.
 *
 * The previous approach stripped everything except digits and dots, which
 * kept the dot from "Rs." and turned "Rs. 4,499" into ".4499" — prices,
 * cart totals and sorting silently computed almost zero. This version
 * removes thousands separators first, then takes the first real number.
 */
export function parsePriceValue(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  const match = value.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}
