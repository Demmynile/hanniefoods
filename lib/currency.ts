export type CurrencyCode = "NGN" | "GBP" | "USD" | "CAD" | "AUD";

interface CurrencyConfig {
  label: string;
  locale: string;
  rateFromNGN: number;
}

// Product prices are stored in NGN and converted at render time.
export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  NGN: { label: "Nigerian Naira (NGN)", locale: "en-NG", rateFromNGN: 1 },
  GBP: { label: "United Kingdom (GBP)", locale: "en-GB", rateFromNGN: 0.00053 },
  USD: { label: "American Dollar (USD)", locale: "en-US", rateFromNGN: 0.00067 },
  CAD: { label: "Canadian Dollars (CAD)", locale: "en-CA", rateFromNGN: 0.00091 },
  AUD: { label: "Australian Dollar (AUD)", locale: "en-AU", rateFromNGN: 0.00102 },
};

export const CURRENCIES = Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
  code: code as CurrencyCode,
  label: config.label,
}));

export const DEFAULT_CURRENCY: CurrencyCode = "NGN";

export function convertFromNGN(amountInNGN: number, currency: CurrencyCode): number {
  return amountInNGN * CURRENCY_CONFIG[currency].rateFromNGN;
}

export function formatPrice(amountInNGN: number, currency: CurrencyCode): string {
  const converted = convertFromNGN(amountInNGN, currency);
  const maxFractionDigits = currency === "NGN" ? 0 : 2;

  return new Intl.NumberFormat(CURRENCY_CONFIG[currency].locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(converted);
}
