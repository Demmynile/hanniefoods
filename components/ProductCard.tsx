import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white/90 shadow-xl transition hover:-translate-y-1"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-amber-100 via-rose-100 to-teal-100">
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white z-10">
            {product.badge}
          </span>
        ) : null}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            priority={false}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            No image
          </div>
        )}
        <div className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 z-10">
          {product.category.title}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-lg font-semibold text-stone-900 transition group-hover:text-amber-700">
            {product.title}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-stone-900">
            ${product.price}
          </span>
        </div>
        <p className="text-sm text-stone-600">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold text-stone-500">
              Rating {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-stone-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
          <button
            onClick={(event) => {
              event.preventDefault();
              handleAddToCart();
            }}
            className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-stone-800 disabled:bg-stone-400"
            disabled={!product.inStock || product.stock === 0}
          >
            {product.inStock && product.stock > 0 ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>
    </Link>
  );
}
