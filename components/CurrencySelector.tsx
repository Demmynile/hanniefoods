import { useId } from "react";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCurrencyStore } from "@/store/currency";

interface CurrencySelectorProps {
  showLabel?: boolean;
  className?: string;
}

export function CurrencySelector({ showLabel = true, className = "" }: CurrencySelectorProps) {
  const selectId = useId();
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);

  return (
    <div className={`space-y-1 ${className}`.trim()}>
      {showLabel && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-widest text-stone-600">
          Display Currency
        </label>
      )}
      <select
        id={selectId}
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className="w-full rounded-xl border border-stone-200/70 bg-white px-3 py-2 text-sm font-medium text-stone-800 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
      >
        {CURRENCIES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
