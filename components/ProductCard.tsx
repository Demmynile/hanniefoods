import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/currency";
import { useCurrencyStore } from "@/store/currency";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const currency = useCurrencyStore((state) => state.currency);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex h-full flex-col rounded-[28px] border-2 border-stone-700/90 p-4 transition duration-300 hover:-translate-y-1.5"
    >
      <div className="relative mb-4 flex min-h-80 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-stone-500/90 p-2 sm:min-h-90">
        {product.badge ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        ) : null}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            priority={false}
            className="object-contain transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            No image
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-700 backdrop-blur-sm">
          {product.category.title}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-1 pb-1">
        <div className="flex items-start justify-between gap-3">
          <span className="text-lg font-semibold text-stone-900 transition group-hover:text-amber-700">
            {product.title}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-stone-900">
            {formatPrice(product.price, currency)}
          </span>
        </div>
        <p className="text-sm text-stone-600 line-clamp-2">{product.description}</p>
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${
                    star <= Math.round(product.rating || 0)
                      ? "text-yellow-500"
                      : "text-stone-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-stone-600">
              {product.rating ? product.rating.toFixed(1) : "No ratings"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-stone-600">
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-medium">✓ {product.stock} in stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of stock</span>
              )}
            </span>
            <button
              onClick={(event) => {
                event.preventDefault();
                handleAddToCart();
              }}
              className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              disabled={!product.inStock || product.stock === 0}
            >
              {product.inStock && product.stock > 0 ? "Add to cart" : "Sold out"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
