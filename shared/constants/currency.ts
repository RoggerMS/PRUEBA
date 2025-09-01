// Currency conversion constants
export const CURRENCY_CONVERSION = {
  // Based on business rules: 5,000 Crolars = 5 soles
  CROLARS_TO_SOLES: 1000, // 1,000 Crolars = 1 Sol
  SOLES_TO_CROLARS: 1000, // 1 Sol = 1,000 Crolars
  MIN_WITHDRAWAL_CROLARS: 5000, // Minimum withdrawal amount
  MIN_WITHDRAWAL_SOLES: 5 // Equivalent in soles
};

/**
 * Convert Crolars to Soles
 * @param crolars Amount in Crolars
 * @returns Amount in Soles
 */
export function crolarsToSoles(crolars: number): number {
  return crolars / CURRENCY_CONVERSION.CROLARS_TO_SOLES;
}

/**
 * Convert Soles to Crolars
 * @param soles Amount in Soles
 * @returns Amount in Crolars
 */
export function solesToCrolars(soles: number): number {
  return soles * CURRENCY_CONVERSION.SOLES_TO_CROLARS;
}

/**
 * Format price display with both currencies
 * @param crolars Price in Crolars
 * @param showBoth Whether to show both currencies
 * @returns Formatted price string
 */
export function formatPrice(crolars: number, showBoth: boolean = false): string {
  if (crolars === 0) return 'Gratis';
  
  const soles = crolarsToSoles(crolars);
  
  if (showBoth) {
    return `${crolars.toLocaleString()} Crolars (S/ ${soles.toFixed(2)})`;
  }
  
  // Show in soles if >= 1 sol, otherwise show in Crolars
  if (soles >= 1) {
    return `S/ ${soles.toFixed(2)}`;
  }
  
  return `${crolars.toLocaleString()} Crolars`;
}