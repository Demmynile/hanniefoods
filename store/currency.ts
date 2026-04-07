import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "hanniefoods-currency",
      version: 1,
    }
  )
);
