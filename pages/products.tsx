import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { HomeSkeleton } from "@/components/Skeletons";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { useProducts } from "@/hooks/useProducts";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const router = useRouter();
  const { products, isLoading } = useProducts();
  const queryFromUrl = typeof router.query.q === "string" ? router.query.q : "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const searchableValues = [
        product.title,
        product.description,
        product.category.title,
        product.badge || "",
      ];

      return searchableValues.some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [products, normalizedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page]);

  const startItem = filteredProducts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, filteredProducts.length);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();

    void router.push(
      {
        pathname: "/products",
        query: query ? { q: query } : {},
      },
      undefined,
      { shallow: true }
    );
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
      <section className="rounded-3xl border-2 border-stone-300/80 bg-white/70 p-5 shadow-lg md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">
            Browse Products
          </h1>
          <Link
            href="/"
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
          >
            Back Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by product name, category, or keyword"
              className="w-full rounded-2xl border-2 border-stone-400/90 bg-white px-12 py-3.5 text-sm text-stone-900 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-200/60 sm:text-base"
              aria-label="Search products"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl border-2 border-stone-800 bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-stone-800 sm:whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mt-8 flex flex-col gap-4">
        <p className="text-sm text-stone-600">
          Showing {startItem}-{endItem} of {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          {normalizedSearch ? ` for \"${searchQuery.trim()}\"` : ""}
        </p>

        {filteredProducts.length > 0 ? (
          <>
            <ProductGrid products={paginatedProducts} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-stone-600">
            No products match your search. Try another keyword.
          </div>
        )}
      </section>
    </div>
  );
}
