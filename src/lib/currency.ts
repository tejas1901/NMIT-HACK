/**
 * FreightIQ Unified Currency System
 * Formats all monetary values into Indian Rupee (INR / ₹) with standard Indian numbering system (Lakh / Crore).
 * Configured via single USD_INR_RATE = 86.40.
 */

export const USD_INR_RATE = 86.40;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const inrFormatterWithDecimals = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/**
 * Standard INR Formatter (e.g. ₹94,70,997 or ₹14,850.00)
 */
export function formatInr(
  amount: number, 
  options: { decimals?: boolean; forceDecimals?: boolean } = {}
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  if (options.forceDecimals) {
    return inrFormatterWithDecimals.format(amount);
  }
  return inrFormatter.format(amount);
}

/**
 * Compact Indian Currency Formatter (e.g. ₹9.85 Cr, ₹12.83 L)
 * Guaranteed to fit single-line KPI cards without wrapping or overflow.
 */
export function formatInrCompact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const cr = abs / 10000000;
    return `${sign}₹${cr.toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lakh = abs / 100000;
    return `${sign}₹${lakh.toFixed(2)} L`;
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}₹${k.toFixed(1)} K`;
  }

  return formatInr(amount);
}

/**
 * Convert USD amount natively to INR using standardized rate
 */
export function usdToInr(usdAmount: number): number {
  return Math.round(usdAmount * USD_INR_RATE * 100) / 100;
}
