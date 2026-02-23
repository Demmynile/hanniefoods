import { memo, useEffect, useMemo, useState } from "react";
import { CategoryPills } from "@/components/CategoryPills";
import { FilterPanel, type ProductFilters } from "@/components/FilterPanel";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductSlider } from "@/components/ProductSlider";
import { HomeSkeleton } from "@/components/Skeletons";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

const defaultFilters: ProductFilters = {
  search: "",
  category: "all",
  price: "all",
  sort: "featured",
};

const pageSize = 6;

const matchesPrice = (product: Product, price: string) => {
  if (price === "under-15") return product.price < 15;
  if (price === "15-30") return product.price >= 15 && product.price <= 30;
  if (price === "30-60") return product.price >= 30 && product.price <= 60;
  if (price === "60-plus") return product.price > 60;
  return true;
};

const HomePage = memo(function HomePage() {
  const { products, categories, isLoading } = useProducts();
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();
    let filtered = products.filter((product) => {
      const matchesSearch = normalizedSearch
        ? product.title.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesCategory =
        filters.category === "all"
          ? true
          : product.category.slug === filters.category;
      const matchesPriceRange = matchesPrice(product, filters.price);

      return matchesSearch && matchesCategory && matchesPriceRange;
    });

    if (filters.sort === "price-asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (filters.sort === "price-desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (filters.sort === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else {
      filtered = [...filtered].sort((a, b) =>
        Number(b.featured) - Number(a.featured)
      );
    }

    return filtered;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageItems = useMemo(
    () => filteredProducts.slice((page - 1) * pageSize, page * pageSize),
    [filteredProducts, page]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 4),
    [products]
  );

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="flex flex-col gap-16 lg:gap-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
              Food Market
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-stone-900 [font-family:var(--font-display)] lg:text-5xl">
              Curated food essentials delivered with a modern pantry vibe.
            </h1>
            <p className="max-w-xl text-base text-stone-600">
              Build your weekly drop with fresh produce, pantry upgrades, and
              ready-to-heat meals. All sourced from trusted local partners.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-3xl border border-stone-200/70 bg-white/80 px-4 py-3 shadow-xl">
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Delivery
                </p>
                <p className="text-lg font-semibold text-stone-900">Same day</p>
              </div>
              <div className="rounded-3xl border border-stone-200/70 bg-white/80 px-4 py-3 shadow-xl">
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Curations
                </p>
                <p className="text-lg font-semibold text-stone-900">52 drops</p>
              </div>
              <div className="rounded-3xl border border-stone-200/70 bg-white/80 px-4 py-3 shadow-xl">
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Favorites
                </p>
                <p className="text-lg font-semibold text-stone-900">Top rated</p>
              </div>
            </div>
          </div>
          <ProductSlider products={featuredProducts} />
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Shop by category
            </h2>
            <span className="text-sm text-stone-500">
              {products.length} products curated
            </span>
          </div>
          <CategoryPills
            categories={categories}
            active={filters.category}
            onChange={(slug) => setFilters({ ...filters, category: slug })}
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <FilterPanel categories={categories} filters={filters} onChange={setFilters} />
          </aside>
          <div className="flex flex-col gap-6">
            {products.length === 0 ? (
              <div className="flex items-center justify-center min-h-96 text-stone-500">
                <p className="text-lg">No product found</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-96 text-stone-500">
                <p className="text-8xl mb-4">😢</p>
                <p className="text-lg">Filtered product not found</p>
              </div>
            ) : (
              <>
                <ProductGrid products={pageItems} />
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
});

export default HomePage;
