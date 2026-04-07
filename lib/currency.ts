export type CurrencyCode = "NGN" | "GBP" | "USD" | "CAD" | "AUD";

interface CurrencyConfig {
  label: string;
  locale: string;
  rateFromNGN: number;
  lastUpdated: string;
  source: string;
}

const STATIC_RATE_SOURCE = "Manual static rates (display only)";
const STATIC_RATE_LAST_UPDATED = "2026-04-07T00:00:00.000Z";

// Exchange rates are approximate and used for display only.
// Payments are charged in NGN. Update rates manually as needed.
export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  NGN: {
    label: "Nigerian Naira (NGN)",
    locale: "en-NG",
    rateFromNGN: 1,
    lastUpdated: STATIC_RATE_LAST_UPDATED,
    source: STATIC_RATE_SOURCE,
  },
  GBP: {
    label: "United Kingdom (GBP)",
    locale: "en-GB",
    rateFromNGN: 0.00053,
    lastUpdated: STATIC_RATE_LAST_UPDATED,
    source: STATIC_RATE_SOURCE,
  },
  USD: {
    label: "American Dollar (USD)",
    locale: "en-US",
    rateFromNGN: 0.00067,
    lastUpdated: STATIC_RATE_LAST_UPDATED,
    source: STATIC_RATE_SOURCE,
  },
  CAD: {
    label: "Canadian Dollars (CAD)",
    locale: "en-CA",
    rateFromNGN: 0.00091,
    lastUpdated: STATIC_RATE_LAST_UPDATED,
    source: STATIC_RATE_SOURCE,
  },
  AUD: {
    label: "Australian Dollar (AUD)",
    locale: "en-AU",
    rateFromNGN: 0.00102,
    lastUpdated: STATIC_RATE_LAST_UPDATED,
    source: STATIC_RATE_SOURCE,
  },
};

export const EXCHANGE_RATE_NOTICE =
  "Exchange rates are approximate for display and may be stale. Payments are processed in NGN.";

export const CURRENCIES = Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
  code: code as CurrencyCode,
  label: config.label,
}));

export const DEFAULT_CURRENCY: CurrencyCode = "NGN";

export function updateExchangeRates(
  updates: Partial<Record<Exclude<CurrencyCode, "NGN">, number>>,
  source = "Manual update"
) {
  const timestamp = new Date().toISOString();

  (Object.keys(updates) as Array<Exclude<CurrencyCode, "NGN">>).forEach((code) => {
    if (!CURRENCY_CONFIG[code]) {
      throw new TypeError(`Unsupported currency code in updates: ${String(code)}`);
    }

    const nextRate = updates[code];
    if (typeof nextRate !== "number" || !Number.isFinite(nextRate) || nextRate <= 0) {
      throw new TypeError(`Invalid exchange rate for ${code}. Expected a positive finite number.`);
    }

    CURRENCY_CONFIG[code].rateFromNGN = nextRate;
    CURRENCY_CONFIG[code].lastUpdated = timestamp;
    CURRENCY_CONFIG[code].source = source;
  });
}

export function convertFromNGN(amountInNGN: number, currency: CurrencyCode): number {
  if (typeof amountInNGN !== "number" || Number.isNaN(amountInNGN) || !Number.isFinite(amountInNGN)) {
    throw new TypeError("amountInNGN must be a finite number.");
  }

  if (amountInNGN < 0) {
    throw new RangeError("amountInNGN cannot be negative.");
  }

  const config = CURRENCY_CONFIG[currency];
  if (!config) {
    throw new RangeError(`Unsupported currency code: ${currency}`);
  }

  return amountInNGN * config.rateFromNGN;
}

export function formatPrice(amountInNGN: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) {
    throw new RangeError(`Unsupported currency code: ${currency}`);
  }

  const converted = convertFromNGN(amountInNGN, currency);
  const fractionDigits = currency === "NGN" ? 0 : 2;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted);
}
