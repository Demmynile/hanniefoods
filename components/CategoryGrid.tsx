import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/types/product";

interface CategoryGridProps {
  categories: Category[];
  products: Product[];
}

export function CategoryGrid({ categories, products }: CategoryGridProps) {
  const uniqueCategories = categories.reduce((acc, category) => {
    const exists = acc.some(
      (entry) => (entry.id || entry.slug) === (category.id || category.slug)
    );

    return exists ? acc : [...acc, category];
  }, [] as Category[]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {uniqueCategories.map((category) => {
        const slug = category.slug || category.id;
        const productCount = products.filter(
          (product) => product.category.slug === category.slug
        ).length;
        const previewImage =
          category.image ||
          products.find((product) => product.category.slug === category.slug)?.images?.[0] ||
          null;

        return (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className="group overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white/90 shadow-[0_18px_50px_rgba(120,113,108,0.14)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/80 hover:shadow-[0_24px_60px_rgba(217,119,6,0.18)]"
          >
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={category.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.28),_transparent_50%),linear-gradient(145deg,_rgba(255,251,235,1)_0%,_rgba(245,245,244,1)_100%)] p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
                    {category.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-6 text-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
                    Shop Category
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold [font-family:var(--font-display)]">
                    {category.title}
                  </h3>
                </div>
                <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                  {productCount} {productCount === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <p className="text-sm text-stone-600">
                Browse everything available in {category.title.toLowerCase()}.
              </p>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 transition group-hover:translate-x-1">
                Open
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}