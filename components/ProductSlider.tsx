import { memo, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export const ProductSlider = memo(function ProductSlider({ products }: { products: Product[] }) {
  // Filter to only show products with images
  const productsWithImages = useMemo(
    () => products.filter((product) => product.images && product.images.length > 0 && product.images[0]),
    [products]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (productsWithImages.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % productsWithImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [productsWithImages.length]);

  if (!productsWithImages.length) {
    return null;
  }

  const activeProduct = productsWithImages[activeIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-linear-to-br from-white via-amber-50 to-teal-50 p-6 shadow-xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
            Featured Drop
          </span>
          <h3 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
            {activeProduct.title}
          </h3>
          <p className="text-sm text-stone-600">{activeProduct.description}</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              ${activeProduct.price}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              {activeProduct.category.title}
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-amber-100/60 bg-white/70">
          <img
            src={activeProduct.images?.[0] || ""}
            alt={activeProduct.title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {productsWithImages.map((product, index) => (
          <button
            key={product.id}
            onClick={() => setActiveIndex(index)}
            className={`h-2 flex-1 rounded-full transition ${
              index === activeIndex ? "bg-stone-900" : "bg-stone-300/60"
            }`}
            aria-label={`Show ${product.title}`}
          />
        ))}
      </div>
    </div>
  );
 });
