import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DetailSkeleton } from "@/components/Skeletons";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

export default function ProductDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { products, isLoading: isProductsLoading } = useProducts();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = (await response.json()) as Product | null;
        if (active) {
          setProduct(data);
          setQuantity(1);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        if (active) {
          setProduct(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const recommendations = useMemo(() => {
    if (!product) {
      return [];
    }
    return products
      .filter(
        (item) =>
          item.category.id === product.category.id && item.id !== product.id
      )
      .slice(0, 4);
  }, [products, product]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    const existingQty =
      items.find((item) => item.product.id === product.id)?.quantity ?? 0;
    addItem(product);
    updateQuantity(product.id, existingQty + quantity);
    toast.success(`${product.title} added to cart!`);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-8 md:p-12 shadow-lg text-center">
          <h1 className="text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">
            Product not found
          </h1>
          <p className="mt-3 text-base text-stone-600">
            Try selecting another item from the catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="space-y-16 lg:space-y-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-br from-stone-100 to-white/80 shadow-lg h-80 md:h-96 lg:h-full min-h-full">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                No image
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              {product.badge ? (
                <span className="w-fit rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">
                  {product.badge}
                </span>
              ) : null}
              <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 [font-family:var(--font-display)] leading-tight">
                {product.title}
              </h1>
              <p className="text-xs uppercase tracking-widest font-semibold text-stone-600">
                {product.category.title}
              </p>
            </div>

            <p className="text-base text-stone-600 leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="rounded-xl bg-amber-100/60 border border-amber-200/70 px-4 py-2.5">
                <p className="text-xs uppercase tracking-widest font-semibold text-stone-600">Price</p>
                <p className="text-2xl md:text-3xl font-bold text-stone-900 mt-1">
                  ₦{product.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-stone-600">Rating</p>
                <p className="text-lg font-semibold text-stone-900 mt-1">{product.rating.toFixed(1)} ⭐</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-stone-600">Stock</p>
                <p className={`text-lg font-semibold mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <div className="flex items-center rounded-xl border border-stone-200/70 bg-stone-50/50 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-stone-200 transition text-stone-600 font-semibold text-sm"
                >
                  −
                </button>
                <span className="min-w-[50px] text-center text-sm font-semibold text-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-stone-200 transition text-stone-600 font-semibold text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 sm:flex-none rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed"
                disabled={!product.inStock || product.stock === 0}
              >
                {product.inStock && product.stock > 0 ? "Add to cart" : "Sold out"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Recommended from {product.category.title}
            </h2>
          </div>
          {isProductsLoading ? (
            <DetailSkeleton />
          ) : recommendations.length ? (
            <ProductGrid products={recommendations} />
          ) : (
            <p className="text-sm text-stone-500 py-8 text-center">
              No similar products yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
