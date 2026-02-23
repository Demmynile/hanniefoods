import type { Category } from "@/types/product";
import { useCallback, useEffect, useRef, useState } from "react";

export type ProductFilters = {
  search: string;
  category: string;
  price: string;
  sort: string;
};

const priceOptions = [
  { value: "all", label: "Any price" },
  { value: "under-15", label: "Under $15" },
  { value: "15-30", label: "$15 to $30" },
  { value: "30-60", label: "$30 to $60" },
  { value: "60-plus", label: "$60+" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
  { value: "rating", label: "Top rated" },
];

export function FilterPanel({
  categories,
  filters,
  onChange,
}: {
  categories: Category[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}) {
  const categoryOptions = [
    { id: "all", title: "All categories", slug: "all" },
    ...categories,
  ];
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput, filters, onChange]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-lg sticky top-20 space-y-5">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Search</span>
        <input
          value={searchInput}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search products"
          className="w-full rounded-xl border border-stone-200/70 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 placeholder-stone-400 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Category</span>
        <select
          value={filters.category}
          onChange={(event) =>
            onChange({ ...filters, category: event.target.value })
          }
          className="w-full rounded-xl border border-stone-200/70 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        >
          {categoryOptions.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Price</span>
        <select
          value={filters.price}
          onChange={(event) => onChange({ ...filters, price: event.target.value })}
          className="w-full rounded-xl border border-stone-200/70 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        >
          {priceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Sort</span>
        <select
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value })}
          className="w-full rounded-xl border border-stone-200/70 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={() =>
          onChange({ search: "", category: "all", price: "all", sort: "featured" })
        }
        className="w-full rounded-xl border border-stone-200/70 bg-stone-50 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-stone-700 transition hover:bg-amber-100/60 hover:border-amber-300 focus:ring-2 focus:ring-amber-200"
      >
        Reset Filters
      </button>
    </div>
  );
}
