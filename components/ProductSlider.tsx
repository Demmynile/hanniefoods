import { memo, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export const ProductSlider = memo(function ProductSlider({ products }: { products: Product[] }) {
  // Filter to only show products with images
  const productsWithImages = useMemo(
    () => products.filter((product) => product.images && product.images.length > 0 && product.images[0]),
    [products]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (productsWithImages.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % productsWithImages.length);
        setIsTransitioning(false);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, [productsWithImages.length]);

  if (!productsWithImages.length) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/60 bg-stone-50 p-6 shadow-xl flex items-center justify-center min-h-[300px]">
        <p className="text-stone-500">No products available</p>
      </div>
    );
  }

  const activeProduct = productsWithImages[activeIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-white via-amber-50 to-teal-50 p-6 shadow-xl transition-all duration-500 hover:shadow-2xl">
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700 animate-pulse">
              Featured Drop
            </span>
            <h3 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              {activeProduct.title}
            </h3>
            <p className="text-sm text-stone-600 line-clamp-2">{activeProduct.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105">
                ₦{activeProduct.price.toLocaleString()}
              </span>
              {activeProduct.badge && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                  {activeProduct.badge}
                </span>
              )}
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                {activeProduct.category.title}
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-amber-100/60 bg-white/70 shadow-lg group">
            <img
              src={activeProduct.images?.[0] || ""}
              alt={activeProduct.title}
              className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {productsWithImages.map((product, index) => (
          <button
            key={product.id}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setActiveIndex(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-stone-900 scale-105" : "bg-stone-300/60 hover:bg-stone-400/80"
            }`}
            aria-label={`Show ${product.title}`}
          />
        ))}
      </div>
    </div>
  );
 });
