import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { HomeSkeleton } from "@/components/Skeletons";
import { useProducts } from "@/hooks/useProducts";

export default function CategoryProductsPage() {
  const router = useRouter();
  const slug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;
  const { products, categories: rawCategories, isLoading } = useProducts();

  const categories = useMemo(() => {
    return rawCategories.reduce((acc, category) => {
      const exists = acc.some(
        (entry) => (entry.id || entry.slug) === (category.id || category.slug)
      );
      return exists ? acc : [...acc, category];
    }, [] as typeof rawCategories);
  }, [rawCategories]);

  const category = useMemo(
    () => categories.find((entry) => entry.slug === slug) ?? null,
    [categories, slug]
  );

  const categoryProducts = useMemo(
    () => products.filter((product) => product.category.slug === slug),
    [products, slug]
  );

  const fallbackImage = categoryProducts.find((product) => product.images?.[0])?.images?.[0] ?? null;
  const otherCategories = categories.filter((entry) => entry.slug !== slug).slice(0, 3);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  if (!slug || !category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="rounded-4xl border border-stone-200/70 bg-white/90 p-8 text-center shadow-xl md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
            Category
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-stone-900 [font-family:var(--font-display)] md:text-4xl">
            Category not found
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-stone-600">
            The category you requested does not exist or has not been published yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-12 lg:gap-16">
        <section className="grid gap-8 overflow-hidden rounded-4xl border border-stone-200/70 bg-white/90 shadow-[0_24px_70px_rgba(120,113,108,0.16)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6 p-8 md:p-10 lg:p-12">
            <Link
              href="/"
              className="w-fit text-xs font-semibold uppercase tracking-[0.35em] text-amber-700 transition hover:text-amber-800"
            >
              Back to categories
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
                Browse Category
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-stone-900 [font-family:var(--font-display)] md:text-5xl">
                {category.title}
              </h1>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-stone-600">
              Explore everything currently available in {category.title.toLowerCase()}. Each product below belongs to this category only.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl border border-stone-200/70 bg-stone-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  Products
                </p>
                <p className="mt-1 text-2xl font-semibold text-stone-900">
                  {categoryProducts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-80 bg-linear-to-br from-amber-100 via-orange-50 to-stone-100">
            {category.image || fallbackImage ? (
              <Image
                src={category.image || fallbackImage || ""}
                alt={category.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            ) : (
              <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.28),transparent_50%),linear-gradient(145deg,rgba(255,251,235,1)_0%,rgba(245,245,244,1)_100%)] p-8">
                <span className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">
                  {category.title}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-stone-950/35 via-transparent to-transparent" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)] md:text-3xl">
              Products in {category.title}
            </h2>
            <span className="text-sm text-stone-500">
              {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {categoryProducts.length ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <div className="rounded-4xl border border-dashed border-stone-300 bg-white/70 p-10 text-center text-stone-500">
              No products have been added to this category yet.
            </div>
          )}
        </section>

        {otherCategories.length ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
                Explore more categories
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {otherCategories.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/category/${entry.slug || entry.id}`}
                  className="rounded-3xl border border-stone-200/70 bg-white/85 px-5 py-5 text-stone-800 shadow-lg transition hover:-translate-y-1 hover:border-amber-300/80"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
                    Category
                  </p>
                  <h3 className="mt-3 text-xl font-semibold [font-family:var(--font-display)]">
                    {entry.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}